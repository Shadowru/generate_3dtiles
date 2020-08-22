import * as fs from "fs";

import Logger from "js-logger";
import * as turf from '@turf/turf'

import CachedFileLoader from './CachedFileLoader'
import ThreeXMBO from "./ThreeXMBO";
import SRSProcessor from "./SRSProcessor";

import {Cartesian3, HeadingPitchRoll, Matrix4, Transforms} from "cesium";

import CTM2GLBConverter from './CTM2GLBConverter'

export default class ThreeMXProcessor {

    constructor(options) {
        this._options = options;

        const {header, layers} = this._loadHeader();

        this._header = header;
        this._layers = layers;

        this._fileLoader = new CachedFileLoader(this._options);

        this._loadLayers(this._layers, this._fileLoader, this._options.depth);

    }

    _parseHeader(threeMXObject) {
        return {
            "name": threeMXObject.name,
            "description": threeMXObject.description
        };
    }

    _loadHeader() {
        const threeMXObject = this._loadThreeMX(this._options.threeMXFile);
        const header = this._parseHeader(threeMXObject);
        const layers = this._parseLayers(threeMXObject.layers);

        return {header, layers};
    }

    _parseLayers(threeMxLayers) {
        const layers = [];
        for (const threeMxLayer of threeMxLayers) {
            const layer = {
                "name": threeMxLayer.name,
                "description": threeMxLayer.description,
                "root": threeMxLayer.root,
                "coordinateConverter": SRSProcessor.proceedSRS(threeMxLayer.SRS, threeMxLayer.SRSOrigin),
                "wgs84Converter": SRSProcessor.proceedSRS(threeMxLayer.SRS, threeMxLayer.SRSOrigin, 'EPSG:4326')
            };

            layer.wgs84_origin = layer.wgs84Converter.forward([0, 0, 0])

            layers.push(layer);
        }
        return layers;
    }

    _loadThreeMX(threeMXFile) {
        const raw_data = fs.readFileSync(threeMXFile);
        return JSON.parse(raw_data);
    }

    getLayer(number) {
        return this._layers[number];
    }

    getHeader() {
        return this._header;
    }

    _loadLayers(layers, fileLoader, depth) {
        for (const layer of layers) {
            const rootFile = fileLoader.getFile(layer.root);
            this._parseThreeXMBO(layer, rootFile);
            //this._loadChidrens(rootFile, fileLoader, depth);
        }
    }

    _loadChidrens(threeXMBOFile, fileLoader, depth) {
        this._parseThreeXMBO(threeXMBOFile);
    }

    _parseThreeXMBO(layer, rootFile) {
        layer._threeXMBO = new ThreeXMBO(rootFile);
        this._generateGeometryProperties(layer, layer._threeXMBO.getNodes());
    }

    _generateGeometryProperties(layer, node_list) {

        let bounding_box_min = undefined;
        let bounding_box_max = undefined;

        for (const node of node_list) {
            bounding_box_min = this._proceedCoords(bounding_box_min, node.bbMin, Math.min);
            bounding_box_max = this._proceedCoords(bounding_box_max, node.bbMax, Math.max);
        }

        Logger.debug(JSON.stringify(bounding_box_min));
        Logger.debug(JSON.stringify(bounding_box_max));

        //const coords_min = layer.coordinateConverter.forward(bounding_box_min);
        //const coords_max = layer.coordinateConverter.forward(bounding_box_max);

        const coords_min_wgs84 = layer.wgs84Converter.forward(bounding_box_min);
        const coords_max_wgs84 = layer.wgs84Converter.forward(bounding_box_max);

        const coords_min = layer.coordinateConverter.forward(bounding_box_min);
        const coords_max = layer.coordinateConverter.forward(bounding_box_max);


        function average(nums) {
            return nums.reduce((a, b) => (a + b)) / nums.length;
        }

        function delta(nums) {
            return nums.reduce((a, b) => (a - b)) / 2;
        }

        layer.wgs84_center = [
            average([coords_min_wgs84[0], coords_max_wgs84[0]]),
            average([coords_min_wgs84[1], coords_max_wgs84[1]]),
            average([coords_min_wgs84[2], coords_max_wgs84[2]]),
        ];

        var poly = turf.bboxPolygon([coords_min_wgs84[0], coords_min_wgs84[1], coords_max_wgs84[0], coords_max_wgs84[1]]);
        var point = turf.point([layer.wgs84_origin[0], layer.wgs84_origin[1]]);
        var point2 = turf.point([layer.wgs84_center[0], layer.wgs84_center[1]]);

        var collection = turf.featureCollection([
            poly,
            point,
            point2
        ]);

        Logger.debug(JSON.stringify(collection));

        layer.transformMatrix = this._wgs84Transform(layer.wgs84_center);

        let {length, height} = this._calcWGS84toMeters(
            coords_min_wgs84, coords_max_wgs84
        );

        const boundingBox = [
            0,
            0,
            0,
            length / 2,
            0,
            0,
            0,
            height / 2,
            0,
            0,
            0,
            delta([coords_max[2], coords_min[2]]),
        ];

        layer.localBoundingBox = boundingBox;

        Logger.debug('Layer : ' + JSON.stringify(layer, null, 4));
    }

    _proceedCoords(layer_bound, coords, comparator) {
        if (layer_bound === undefined) {
            return coords;
        }
        return [
            comparator(layer_bound[0], coords[0]),
            comparator(layer_bound[1], coords[1]),
            comparator(layer_bound[2], coords[2])
        ]
    }

    _wgs84Transform(tuple) {
        const longitude = tuple[0];
        const latitude = tuple[1];
        const height = tuple[2];

        const matrix4 = Transforms.headingPitchRollToFixedFrame(Cartesian3.fromDegrees(longitude, latitude, height), new HeadingPitchRoll());

        let matrix = [];

        Matrix4.pack(matrix4, matrix, 0);

        return matrix;
    }

    _calcWGS84toMeters(coords_min_wgs84, coords_max_wgs84) {
        const options = 'meters';
        const length = turf.radiansToLength(
            turf.degreesToRadians(coords_max_wgs84[1] - coords_min_wgs84[1]),
            options
        );
        const height = turf.radiansToLength(
            turf.degreesToRadians(coords_max_wgs84[0] - coords_min_wgs84[0]),
            options
        );
        return {
            length, height
        }
    }

    process3D(layer) {
        const xmbo = layer._threeXMBO;

        const nodeResources = xmbo.getResources();

        for (const nodeResource of nodeResources) {

            if (nodeResource === undefined) {
                Logger.error('Resource not found!');
                continue;
            }

            if (nodeResource.type === 'geometryBuffer') {
                if (nodeResource.format === 'ctm') {
                    const byteResource = xmbo.getThreeXMBResource(nodeResource.id);



                }
            }
        }
        return Buffer.alloc(0);
    }
}