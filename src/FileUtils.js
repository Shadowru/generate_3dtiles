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
}