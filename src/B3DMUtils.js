export default class B3DMUtils {
    static createB3dmCurrent(glb, featureTableJson, featureTableBinary, batchTableJson, batchTableBinary) {
        var version = 1;
        var headerByteLength = 28;
        var featureTableJsonByteLength = featureTableJson.length;
        var featureTableBinaryByteLength = featureTableBinary.length;
        var batchTableJsonByteLength = batchTableJson.length;
        var batchTableBinaryByteLength = batchTableBinary.length;
        var gltfByteLength = glb.length;
        var byteLength = headerByteLength + featureTableJsonByteLength + featureTableBinaryByteLength + batchTableJsonByteLength + batchTableBinaryByteLength + gltfByteLength;

        var header = Buffer.alloc(headerByteLength);
        header.write('b3dm', 0);
        header.writeUInt32LE(version, 4);
        header.writeUInt32LE(byteLength, 8);
        header.writeUInt32LE(featureTableJsonByteLength, 12);
        header.writeUInt32LE(featureTableBinaryByteLength, 16);
        header.writeUInt32LE(batchTableJsonByteLength, 20);
        header.writeUInt32LE(batchTableBinaryByteLength, 24);

        return Buffer.concat([header, featureTableJson, featureTableBinary, batchTableJson, batchTableBinary, glb]);
    }

    /**
     * Pad the buffer to the next 4-byte boundary to ensure proper alignment for the section that follows.
     *
     * @param {Buffer} buffer The buffer.
     * @returns {Buffer} The padded buffer.
     *
     * @private
     */
    static getBufferPadded(buffer) {
        var boundary = 4;
        var byteLength = buffer.length;
        var remainder = byteLength % boundary;
        if (remainder === 0) {
            return buffer;
        }
        var padding = (remainder === 0) ? 0 : boundary - remainder;
        var emptyBuffer = Buffer.alloc(padding);
        return Buffer.concat([buffer, emptyBuffer]);
    }
}