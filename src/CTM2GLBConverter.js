import CTM from './CTM'

export default class CTM2GLBConverter {

    constructor(ctmCatalog, byteResource) {
        this._byteResource = byteResource;
        this._ctmCatalog = ctmCatalog;
    }

    convert() {
        const ctm = new CTM(this._ctmCatalog, this._byteResource);
        console.log(ctm);
    }

}