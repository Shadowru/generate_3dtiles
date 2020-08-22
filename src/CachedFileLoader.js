import * as fs from "fs";

var path = require("path");

import Logger from "js-logger";

export default class CachedFileLoader {

    constructor(_options) {
        this._options = _options;
        this._supportedURL = ['http://', 'https://', 'ftp://'];
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
        let cachedFilePath = this._rootDir;
        if (this._isURL(fileURI)) {
            const fileURL = new URL(fileURI);
            cachedFilePath = cachedFilePath + fileURL.pathname;
        } else {
            cachedFilePath = cachedFilePath + '\\' + fileURI;
        }

        Logger.debug('Cached file path : ' + cachedFilePath)

        if (!fs.existsSync(cachedFilePath)) {
            Logger.debug('Cached file is not exists! : ' + cachedFilePath)
            return undefined;
        }

        return fs.readFileSync(cachedFilePath);
    }

    _isURL(fileURI) {
        for (const url_prefix of this._supportedURL) {
            if (fileURI.startsWith(url_prefix)) {
                return true;
            }
        }
        return false;
    }
}