import Logger from "js-logger";

import FileUtils from "./FileUtils";
import * as fs from "fs";

const execSync = require('child_process').execSync;

export default class CTM {


    constructor(ctmCatalog, ctmdata) {
        this._ctmFileCatalog = ctmCatalog;
        //TODO: FIX
        this._appsCatalog = __dirname + '/../3dpartyapp/ctm/'

        this._objectFileName = FileUtils.getRandomName() + '.obj';
        this._textureFileName = FileUtils.getRandomName() + '.jpg';
        this._mtlFileName = FileUtils.getRandomName() + '.mtl';

        this._proceedCTM(
            this._objectFileName,
            this._textureFileName,
            this._mtlFileName,
            ctmdata.data
        );
    }

    _proceedCTM(objectFileName, textureFileName, mtlFileName, data) {
        const tempCTMFile = this._ctmFileCatalog + 'tempCTMfile.ctm';
        let param = '';

        if (textureFileName !== undefined) {
            param = '--calc-normals --texfile ' + textureFileName;
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
    }

    getObjectFileName() {
        return this._objectFileName;
    }
}