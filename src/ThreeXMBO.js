import Logger from "js-logger";

class ThreeXMBO{

    constructor(threeXMBOData) {

        this._threeXMBOData = threeXMBOData;

        this._threeXMBOHeader = this._parseThreeXMBOHeader(this._threeXMBOData);

        this._threeXMBOHeaderResources = this._threeXMBOHeader.resources;

        this._processedResources = this._loadXMBOResources(this._threeXMBOHeaderResources, this._threeXMBOData);

        this._threeXMBOHeaderNodes = this._threeXMBOHeader.nodes;
    }

    getThreeXMBResource(nodeResourceID) {
        //$console.debug('Node resource ID : ' + nodeResourceID);
        if (this._processedResources.has(nodeResourceID)) {
            return this._processedResources.get(nodeResourceID);
        }
        return undefined;
    }

    get threeXMBOHeader() {
        return this._threeXMBOHeader;
    }

    get threeXMBOHeaderNodes() {
        return this._threeXMBOHeaderNodes;
    }

    _checkHeader(layer_data) {
        //TODO : fix
        /*
        layer_data[0] === '3'
        && layer_data[1] === 'M'
        && layer_data[2] === 'X'
        && layer_data[3] === 'B'
        && layer_data[4] === 'O';
         */
        return true;
    }

    _getThreeMXBHeaderLength(layer_data) {
        const header_length = layer_data.readInt32LE(5);
        Logger.debug('header_length : ' + header_length);
        return header_length;
    }

    _getThreeMXBHeader(layer_data) {
        const header_offset = 9;
        const header_length = this._getThreeMXBHeaderLength(layer_data);
        const threeMXBHeader = JSON.parse(
            layer_data.slice(header_offset, header_length + header_offset).toString()
        );
        Logger.debug(JSON.stringify(threeMXBHeader));
        return threeMXBHeader;
    }

    _parseThreeXMBOHeader(layer_data) {

        if (this._checkHeader(layer_data)) {

            return this._getThreeMXBHeader(layer_data);

        } else {
            Logger.error('3XMBO magic number wrong!');
        }
    }

    _loadXMBOResources(threeXMBOHeaderResources, threeMXLayer) {
        const resourceMap = new Map();
        const header_length = this._getThreeMXBHeaderLength(threeMXLayer);
        let header_offset = 9 + header_length;
        for (const threeXMBOHeaderResource of threeXMBOHeaderResources) {

            const byteData = threeMXLayer.slice(
                header_offset,
                header_offset + threeXMBOHeaderResource.size
            );

            header_offset += threeXMBOHeaderResource.size;

            resourceMap.set(
                threeXMBOHeaderResource.id,
                {
                    type: threeXMBOHeaderResource.type,
                    format: threeXMBOHeaderResource.format,
                    texture: threeXMBOHeaderResource.texture,
                    data: byteData
                }
            );
        }
        return resourceMap;
    }

    getNodes() {
        return this._threeXMBOHeaderNodes;
    }
}

export default ThreeXMBO;