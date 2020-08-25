import * as fs from "fs";

var path = require("path");

import Logger from "js-logger";
import FileUtils from "./FileUtils";

export default class CachedFileLoader {

    constructor(_options) {
        this._options = _options;
        this._rootDir = this._getRootDir(this._options.threeMXFile);
    }

    _getRootDir(mxfile) {
        const absolutePath = path.resolve(mxfile);
        Logger.info('Absolute Path : ' + absolutePath);
        const absoluteDir = path.dirname(absolutePath);
        Logger.info('Data root dir : ' + absoluteDir);
        return absoluteDir;
    }

    getFile(fileURI) {
        const relativePath = FileUtils.getRelativePath(fileURI);
        let cachedFilePath = this._rootDir + relativePath;
        Logger.debug('Cached file path : ' + cachedFilePath)

        if (!fs.existsSync(cachedFilePath)) {
            Logger.debug('Cached file is not exists! : ' + cachedFilePath)
            return undefined;
        }

        return {
            xmboFileName: path.basename(relativePath),
            xmboFileDirectory: path.dirname(relativePath),
            file: fs.readFileSync(cachedFilePath)
        };
    }

}