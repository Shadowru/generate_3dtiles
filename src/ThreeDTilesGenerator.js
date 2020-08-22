import ThreeMXProcessor from './ThreeMXProcessor'
import SRSProcessor from "./SRSProcessor";
import * as fs from "fs";

const fsExtra = require('fs-extra');

export default class ThreeDTilesGenerator {


    constructor(options) {
        this._options = options;
        this._tileset = {};
        SRSProcessor.init();
    }

    proceed(tileDir) {

        ThreeDTilesGenerator._ensureCleanup(tileDir);

        const threeMXProcessor = new ThreeMXProcessor(this._options);

        const tileset = {
            "asset": {
                "version": "1.0"
            },
            "geometricError": 500,
            "root": {
                "geometricError": 1,
                "refine": "REPLACE"
            }
        }

        const layer = threeMXProcessor.getLayer(0);

        tileset.root.transform = layer.transformMatrix;
        tileset.root.boundingVolume = {
            "box": layer.localBoundingBox
        }

        tileset.root.extras = {
            name: layer.name
        }

        const contentURI = this._save3D(tileDir, threeMXProcessor, layer);

        tileset.root.content = {
            "uri": contentURI
        };

        this._tileset = tileset;

        this._saveTileset(tileDir, this._tileset);

    }

    _saveTileset(tileDir, tileset) {
        fs.writeFileSync(tileDir + 'tileset.json', JSON.stringify(tileset, null, 4));
    }

    _save3D(tileDir, threeMXProcessor, layer) {
        const data = threeMXProcessor.process3D(layer);
        const tilePath = this._getRandomName() + '.b3dm';
        fs.writeFileSync(tileDir + tilePath, data);
        return tilePath;
    }

    _getRandomName() {
        return Math.random().toString(36).substring(7);
    }

    static _ensureCleanup(path) {
        ThreeDTilesGenerator.ensureExists(path);
        fsExtra.emptyDirSync(path);
    }

    static ensureExists(path) {
        fs.mkdirSync(path, {recursive: true});//, mask, function(err) {
    }
}