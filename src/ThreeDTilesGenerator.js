import * as fs from "fs";
import path from "path";

import ThreeMXProcessor from './ThreeMXProcessor'
import SRSProcessor from "./SRSProcessor";
import FileUtils from "./FileUtils"
import CTM2GLBConverter from "./CTM2GLBConverter";
import TilesetGenerator from "./TilesetGenerator";
import Logger from "js-logger";

export default class ThreeDTilesGenerator {


    constructor(options) {
        this._options = options;
        this._ctmCatalog = './tmp/ctm/';
        this._tilesetCatalog = './tmp/tiles/';
        SRSProcessor.init();
        this._threeMXProcessor = new ThreeMXProcessor(this._options);
    }

    proceed(tileDir) {

        FileUtils.ensureCleanup(tileDir);

        FileUtils.ensureCleanup(this._ctmCatalog);


        const layer = this._threeMXProcessor.getLayer(0);

        this._generateTileset(tileDir, layer, this._threeMXProcessor)

    }

    _generateTileset(tileDir, layer) {

        const xmboRootFile = layer.root;
        const xmboFile = this._threeMXProcessor.parse3XMBOFile(xmboRootFile);
        const startDepth = 0;
        this._process3XmboFile(xmboFile, new TilesetGenerator(layer.wgs84Converter), startDepth);
    }

    _process3XmboFile(xmboFile, tilesetGenerator, depth, tilesetName = 'tileset.json') {
        Logger.info('xmboFile : ' + xmboFile + ' Depth :' + depth);
        if (depth > this._options.depth) {
            return;
        }

        const node_list = xmboFile.getNodes();

        const tileset = {
            "asset": {
                "version": "1.0",
                "gltfUpAxis": "Z"
            },
            "geometricError": this._calcGeometricError(depth),
            "root": {
                "geometricError": this._calcGeometricError(depth),
                "refine": "REPLACE"
            }
        };

        //tileset.root.transform = tilesetGenerator.getTransform(node_list);

        tileset.root.boundingVolume = tilesetGenerator.getRegion(node_list);

        for (const node of node_list) {

            if (node.children !== undefined) {
                const nodeXMBOFilePath = xmboFile.getFileDirectory() + '/' + node.children[0];

                //TODO : multiplies ?
                const nodeXMBOFile = this._threeMXProcessor.parse3XMBOFile(nodeXMBOFilePath);

                if (nodeXMBOFile === undefined) {
                    Logger.error('Node ' + node.id + ' children file ' + nodeXMBOFilePath + ' not found.');
                } else {
                    const childtilesetName = FileUtils.getRandomName() + '.json';
                    this._process3XmboFile(
                        nodeXMBOFile,
                        tilesetGenerator,
                        depth + 1,
                        childtilesetName
                    );
                }
            }
        }

        fs.writeFileSync(tilesetName, JSON.stringify(tileset, null, 4));
    }


    _generateTileset2(tileDir, layer, tilesetName = undefined) {
        this._generateTilesetRecursive(tileDir, layer, 0, tilesetName);
    }

    _generateTilesetRecursive2(tileDir, layer, depth, tilesetName = undefined) {

        const tileset = {
            "asset": {
                "version": "1.0",
                "gltfUpAxis": "Z"
            },
            "geometricError": this._calcGeometricError(depth),
            "root": {
                "geometricError": this._calcGeometricError(depth),
                "refine": "REPLACE"
            }
        }

        tileset.root.transform = layer.transformMatrix;
        tileset.root.boundingVolume = {
            //"box": layer.localBoundingBox
            "region": layer.region
        }

        tileset.root.extras = {
            name: layer.name
        }

        tileset.root.children = [];

        for (const child of layer.children) {
            const childrenObject = {
                "geometricError": this._calcGeometricError(depth + 1),
                "boundingVolume": {
                    "region": child.region
                }
            };
            if (child.resources !== undefined) {
                if (child.resources.length > 0) {

                    const conentUri = this._save3D(
                        tileDir,
                        layer,
                        child.resources
                    );

                    if (conentUri !== undefined) {
                        childrenObject.content = {
                            uri: conentUri
                        }
                    }
                }
            }
            tileset.root.children.push(childrenObject)
        }

        if (tilesetName === undefined) {
            tilesetName = layer.name + '.json';
        }
        const tilePath = path.join(tileDir, tilesetName);

        this._saveTileset(tilePath, tileset);
    }

    _saveTileset(tilePath, tileset) {
        fs.writeFileSync(tilePath, JSON.stringify(tileset, null, 4));
    }

    _save3D(tileDir, layer, ctmData) {

        if (ctmData.length > 1) {
            return undefined;
        }

        const tilePath = FileUtils.getRandomName() + '.b3dm';
        const data = this.processToB3DM(tileDir + tilePath, layer._threeXMBO.getThreeXMBResource(ctmData[0]));
        return tilePath;
    }

    processToB3DM(b3dmName, ctmData) {

        const converter = new CTM2GLBConverter(this._ctmCatalog, ctmData);

        converter.convert(b3dmName).then(
            b3dm => {
                fs.writeFileSync(b3dmName, b3dm);
            },
            error => {
            }
        );
    }

    _calcGeometricError(depth) {
        return 100 - (10 * depth);
    }
}