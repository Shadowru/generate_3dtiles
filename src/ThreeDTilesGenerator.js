import * as fs from "fs";
import path from "path";

import Logger from "js-logger";

const WorkerPool = require('./WorkerPool');
const os = require('os');

import ThreeMXProcessor from './ThreeMXProcessor'
import SRSProcessor from "./SRSProcessor";
import FileUtils from "./FileUtils"
import TilesetGenerator from "./TilesetGenerator";
//import DBStorage from "./DBStorage";

export default class ThreeDTilesGenerator {


    constructor(options) {
        this._options = options;
        this._ctmCatalog = './tmp/ctm/';
        this._tilesetCatalog = './tmp/tiles/';
        SRSProcessor.init();
        this._threeMXProcessor = new ThreeMXProcessor(this._options);

        this._workerPool = new WorkerPool(os.cpus().length);
        //this._dbStorage = new DBStorage();
    }

    proceed(tileDir) {

        FileUtils.ensureCleanup(tileDir);

        FileUtils.ensureCleanup(this._ctmCatalog);

        const layer = this._threeMXProcessor.getLayer(0);

        this._generateTileset(tileDir, layer, this._threeMXProcessor);

        this._workerPool.close();

        //this._dbStorage.close();
    }

    _generateTileset(tileDir, layer) {

        const xmboRootFile = layer.root;
        const xmboFile = this._threeMXProcessor.parse3XMBOFile(xmboRootFile);
        const startDepth = 0;
        this._process3XmboFile(xmboFile, new TilesetGenerator(layer.wgs84Converter, this._options.geometricError), startDepth);
    }

    _generateHash(str) {

        //return FileUtils.getRandomName();

        var hash = 0, i, chr;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return Number(hash).toString(16);
    }

    _process3XmboFile(xmboFile, tilesetGenerator, depth, nodeId = 'Root', screenDiameter = 1000, tilesetName = 'tileset.json', rootResources = undefined) {

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
            "geometricError": this._calcGeometricError(screenDiameter),
            "root": {
                "geometricError": this._calcGeometricError(screenDiameter),
                "refine": "REPLACE"
            }
        };

        tileset.root.extras = {
            name: nodeId
        };

        //TODO: Fix
        if (depth === 0) {
            tileset.root.transform = tilesetGenerator.getTransform(node_list);
        }

        tileset.root.boundingVolume = {
            "region": tilesetGenerator.getRegion(node_list)
        }

        if (rootResources !== undefined) {
            if (rootResources.length === 1) {

                const contentUri = this._save3D(
                    this._tilesetCatalog + '../b3dm/',
                    this._generateHash(nodeId) + '.b3dm',
                    rootResources[0]
                );

                if (contentUri !== undefined) {
                    tileset.root.content = {
                        uri: '../b3dm/' + contentUri
                    }
                }
            }
        }

        if (depth + 1 <= this._options.depth) {

            tileset.root.children = [];

            for (const node of node_list) {

                if (node.children !== undefined) {

                    if (node.children[0] !== undefined) {

                        let screenDiameter = node.maxScreenDiameter;

                        if (screenDiameter === undefined) {
                            return 1000;
                        }

                        const childrenObject = {
                            "geometricError": this._calcGeometricError(screenDiameter),
                            "boundingVolume": {
                                "region": tilesetGenerator.getRegion([node])
                            }
                        };


                        const nodeXMBOFilePath = xmboFile.getFileDirectory() + '/' + node.children[0];

                        //TODO : multiplies ?
                        const nodeXMBOFile = this._threeMXProcessor.parse3XMBOFile(nodeXMBOFilePath);

                        if (nodeXMBOFile === undefined) {
                            Logger.error('Node ' + node.id + ' children file ' + nodeXMBOFilePath + ' not found.');
                        } else {


                            const childtilesetName = FileUtils.getRandomName() + '.json';
                            this._process3XmboFile(
                                nodeXMBOFile,
                                new TilesetGenerator(tilesetGenerator),
                                depth + 1,
                                xmboFile.getFileName() + '_' + nodeId + '_' + node.id,
                                screenDiameter,
                                childtilesetName,
                                this._getResourse(xmboFile, node.resources[0])
                            );

                            childrenObject.content = {
                                uri: childtilesetName
                            }
                        }

                        tileset.root.children.push(childrenObject);
                    }
                }
            }
        }

        const tilePath = path.join(this._tilesetCatalog, tilesetName);

        this._saveTileset(tilePath, tileset);

    }

    _saveTileset(tilePath, tileset) {
        fs.writeFileSync(tilePath, JSON.stringify(tileset, null, 4));
    }

    _save3D(tileDir, b3dmName, ctmData) {

        if (ctmData === undefined) {
            console.log('!!!!');
        }

        const b3dmPath = tileDir + b3dmName;//FileUtils.getRandomName() + '.b3dm';

        if (!fs.existsSync(b3dmPath)) {
            this.processToB3DM(b3dmName, b3dmPath, ctmData);
        }

        return b3dmName;
    }

    processToB3DM(b3dmName, b3dmPath, ctmData) {

        this._workerPool.runTask({
            b3dmName: b3dmName,
            b3dmPath: b3dmPath,
            ctmCatalog: this._ctmCatalog,
            ctmData: ctmData,
        }, (err, result) => {
            if (result !== undefined) {
                fs.writeFileSync(b3dmPath, result.b3dm);
                fs.writeFileSync(b3dmPath + '.glb', result.glb);

                // this._dbStorage.insertB3DM(b3dmName, result).then(() => {
                //
                // });

            } else {
                Logger.error('Cant save : ' + b3dmName);
            }
        });

    }

    _calcGeometricError(screenDiameter) {

        if(screenDiameter === undefined){
            return 100;
        }

        if(screenDiameter === 0){
            return 100;
        }

        const geometricError = 2000 * (1 / Math.sqrt(screenDiameter));

        return geometricError;
        //return Math.round(500 - (depth * 500 / this._options.depth));
    }

    _getResourse(xmboFile, resource) {
        if (resource !== undefined) {
            const ctmdata = xmboFile.getThreeXMBResource(resource);
            if (ctmdata !== undefined) {
                if (ctmdata.texture !== undefined) {
                    ctmdata.texture = xmboFile.getThreeXMBResource(ctmdata.texture);
                }
            }
            return [ctmdata];
        }
        return undefined;
    }
}