import CTMConverter from './CTMConverter'
import Logger from "js-logger";
import obj2gltf from "obj2gltf";
import * as fs from "fs";

export default class CTM2GLBConverter {

    static convert(ctmCatalog, byteResource) {
        return new Promise((b3dm, error) => {
            const errorHandler = error;
            try {
                const ctm = new CTMConverter(ctmCatalog, byteResource);

                const objFilePath = ctmCatalog + ctm.getObjectFileName();

                console.log(objFilePath);

                this._convertToGLB(objFilePath).then(
                    glb => {

                        fs.writeFileSync(objFilePath + '.glb', glb);

                        let b3DMBufferLength = 0;
                        //B3DM header
                        b3DMBufferLength += 28;
                        //feature table
                        const featureTable = {
                            "BATCH_LENGTH": 0
                        };

                        let featureTableString = JSON.stringify(featureTable);
                        while (featureTableString.length % 8 > 0) {
                            featureTableString += ' ';
                        }
                        b3DMBufferLength += featureTableString.length;

                        //Logger.info('Header length ' + b3DMBufferLength);
                        //Logger.info('GLB length ' + glb.length);

                        const b3DMLength = b3DMBufferLength + glb.length;

                        const b3DMBuffer = Buffer.alloc(b3DMLength);

                        let offset = 0;
                        offset += b3DMBuffer.write('b3dm', offset);
                        //Version
                        offset = b3DMBuffer.writeUInt32LE(0x01, offset);
                        //byteLength
                        offset = b3DMBuffer.writeUInt32LE(b3DMLength, offset);
                        //featureTableJSONByteLength
                        offset = b3DMBuffer.writeUInt32LE(featureTableString.length, offset);
                        //featureTableBinaryByteLength
                        offset = b3DMBuffer.writeUInt32LE(0x00, offset);
                        //batchTableJSONByteLength
                        offset = b3DMBuffer.writeUInt32LE(0x00, offset);
                        //batchTableBinaryByteLength
                        offset = b3DMBuffer.writeUInt32LE(0x00, offset);
                        //gltfFormat
                        //offset = b3DMBuffer.writeUInt32LE(0x01, offset);
                        //feature table
                        offset += b3DMBuffer.write(featureTableString, offset);
                        //glb
                        glb.copy(b3DMBuffer, offset);

                        b3dm({b3dm: b3DMBuffer, glb: glb});

                    },
                    error => {
                        Logger.error('_convertToGLB error : ' + error);
                        errorHandler(error);
                    }
                );
            } catch (ex){
                Logger.error('_convertToGLB ex : ' + ex);
                errorHandler(ex)
            }
        })
    }

    static _convertToGLB(objFilePath) {
        const options = {
            separateTextures: false,
            //inputUpAxis: 'Z',
            binary: true
        }
        return obj2gltf(objFilePath, options);
    }
}