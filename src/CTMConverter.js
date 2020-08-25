import Logger from "js-logger";

import FileUtils from "./FileUtils";
import * as fs from "fs";

const execSync = require('child_process').execSync;

export default class CTMConverter {


    constructor(ctmCatalog, ctmdata) {

        if(ctmdata === undefined){
            console.log('!!!!');
        }

        this._ctmFileCatalog = ctmCatalog;
        //TODO: FIX
        this._appsCatalog = __dirname + '/../3dpartyapp/ctm/'


        this._objectFileName = FileUtils.getRandomName() + '.obj';
        this._textureFileName = undefined;
        this._mtlFileName = FileUtils.getRandomName() + '.mtl';

        let textureFile = undefined;
        if (ctmdata.texture !== undefined) {
            this._textureFileName = FileUtils.getRandomName() + '.jpg'
            textureFile = this._saveTexture(this._textureFileName, ctmdata.texture.data);
        }

        this._proceedCTM(
            this._objectFileName,
            this._textureFileName,
            this._mtlFileName,
            ctmdata.data
        );
    }

    _saveTexture(textureFileName, data) {
        const tempTextureFile = this._ctmFileCatalog + textureFileName;
        fs.writeFileSync(tempTextureFile, data);
        return tempTextureFile;
    }

    _proceedCTM(objectFileName, textureFileName, mtlFileName, data) {
        const tempCTMFile = this._ctmFileCatalog + FileUtils.getRandomName() + '.ctm';
        let param = '--calc-normals ';

        if (textureFileName !== undefined) {
            param += ' --texfile ' + textureFileName;
        }

        const tempOutFile = this._ctmFileCatalog + objectFileName;

        fs.writeFileSync(tempCTMFile, data);
        const ctmFileCommand = this._appsCatalog + 'ctmconv ' + tempCTMFile + ' ' + tempOutFile + ' ' + param;
        //const ctmFileCommand = 'ctmconv ' + tempCTMFile + ' ' + tempOutFile + ' ' + param;
        Logger.debug('ctmFileCommand : ' + ctmFileCommand);
        execSync(
            ctmFileCommand,
            {stdio: 'inherit'}
        );

        if (textureFileName !== undefined) {
            this._fixObjFile(tempOutFile, mtlFileName, this._saveMtlFile(this._ctmFileCatalog + mtlFileName, textureFileName));
        }

    }

    _saveMtlFile(mtlFileName, textureFileName) {
        const materialName = FileUtils.getRandomName();
        const mtlFile = "newmtl Material." + materialName + "\r\n" +
            "Ns 96.078431\r\n" +
            "Ka 0.000000 0.000000 0.000000\r\n" +
            "Kd 0.640000 0.640000 0.640000\r\n" +
            "Ks 0.500000 0.500000 0.500000\r\n" +
            "Ni 1.000000\r\n" +
            "d 1.000000\r\n" +
            "illum 2\r\n" +
            "map_Kd " + textureFileName;

        fs.writeFileSync(mtlFileName, mtlFile, 'utf8');
        return materialName;
    }

    _fixObjFile(objectFileName, mtlFileName, materialName) {

        const dataBuffer = fs.readFileSync(objectFileName);

        const mtlLink = "mtllib " + mtlFileName + "\r\n" +
            "usemtl Material." + materialName + "\r\n";

        fs.writeFileSync(objectFileName, mtlLink, 'utf8');
        fs.appendFileSync(objectFileName, dataBuffer);

    }

    getObjectFileName() {
        return this._objectFileName;
    }


}