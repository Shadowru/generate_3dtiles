import fs from "fs";
import * as fsExtra from "fs-extra";

export default class FileUtils {
    static getRandomName() {
        return Math.random().toString(36).substring(7);
    }

    static ensureCleanup(path) {
        FileUtils.ensureExists(path);
        fsExtra.emptyDirSync(path);
    }

    static ensureExists(path) {
        fs.mkdirSync(path, {recursive: true});//, mask, function(err) {
    }

    static getRelativePath(fileURI) {
        if (FileUtils._isURL(fileURI)) {
            const fileURL = new URL(fileURI);
            return fileURL.pathname;
        }
        return '\\' + fileURI;
    }

    static _isURL(fileURI) {
        const _supportedURL = ['http://', 'https://', 'ftp://'];
        for (const url_prefix of _supportedURL) {
            if (fileURI.startsWith(url_prefix)) {
                return true;
            }
        }
        return false;
    }
}