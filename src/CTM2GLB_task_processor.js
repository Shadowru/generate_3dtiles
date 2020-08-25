import fs from "fs";

const {parentPort} = require('worker_threads');

import CTM2GLBConverter from "./CTM2GLBConverter";

parentPort.on('message', (task) => {

    try {

        CTM2GLBConverter.convert(task.ctmCatalog, task.ctmData).then(
            b3dm => {
                parentPort.postMessage(b3dm);
            },
            error => {
                console.log(error);
                parentPort.postMessage(undefined);
            }
        );
    } catch (ex){
        console.log('ex : ' + ex);
        parentPort.postMessage(undefined);
    }

});