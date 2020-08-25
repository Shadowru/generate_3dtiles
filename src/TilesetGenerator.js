import {Cartesian3, HeadingPitchRoll, Matrix4, Transforms} from "cesium";
import * as turf from "@turf/turf";

export default class TilesetGenerator {
    constructor(foo, bar = undefined) {
        if (foo instanceof TilesetGenerator) {
            this._converter = foo._converter;
            this._ge = foo.ge;
        } else {
            this._converter = foo;
            this._ge = bar;
        }
    }

    getTransform(node_list) {

        function average(nums) {
            return nums.reduce((a, b) => (a + b)) / nums.length;
        }

        let {coords_min_wgs84, coords_max_wgs84} = this._getWGS84Coords(node_list);

        const wgs84_center = [
            average([coords_min_wgs84[0], coords_max_wgs84[0]]),
            average([coords_min_wgs84[1], coords_max_wgs84[1]]),
            average([coords_min_wgs84[2], coords_max_wgs84[2]]),
        ];

        const wgs84_origin = this._converter.forward([0, 0, -(coords_min_wgs84[2] + this._ge)]);

        return this._wgs84Transform(wgs84_origin)
    }

    getRegion(node_list) {

        let {coords_min_wgs84, coords_max_wgs84} = this._getWGS84Coords(node_list);

        return this._generateRegion(coords_min_wgs84, coords_max_wgs84);
    }

    _generateRegion(coords_min_wgs84, coords_max_wgs84) {
        return [
            turf.degreesToRadians(coords_min_wgs84[0]),
            turf.degreesToRadians(coords_min_wgs84[1]),
            turf.degreesToRadians(coords_max_wgs84[0]),
            turf.degreesToRadians(coords_max_wgs84[1]),
            0, coords_max_wgs84[2] - coords_min_wgs84[2]
            //coords_min_wgs84[2], coords_max_wgs84[2]
        ]
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

    _getWGS84Coords(node_list) {
        let bounding_box_min = undefined;
        let bounding_box_max = undefined;

        for (const node of node_list) {
            bounding_box_min = this._proceedCoords(bounding_box_min, node.bbMin, Math.min);
            bounding_box_max = this._proceedCoords(bounding_box_max, node.bbMax, Math.max);
        }

        const coords_min_wgs84 = this._converter.forward(bounding_box_min);
        const coords_max_wgs84 = this._converter.forward(bounding_box_max);

        return {coords_min_wgs84, coords_max_wgs84};
    }
}