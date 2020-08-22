import Logger from "js-logger";
import proj4 from "proj4";

export default class SRSProcessor {

    static init() {
        proj4.defs("EPSG:4978", "+proj=geocent +datum=WGS84 +units=m +no_defs");
    }

    static proceedSRS(SRS, SRSOrigin, projection = 'EPSG:4978') {

        Logger.info('SRS : ' + SRS);
        const converter = proj4(SRS, projection);
        if (converter === undefined) {
            Logger.error('Undefined converter!');
            return undefined;
        }
        const originCoord = SRSOrigin;
        const coordClone = originCoord.slice(0);
        Logger.info('SRSOrigin : ' + originCoord + ' [' + converter.forward(coordClone) + ']');

        const originConverter = {
            converter: converter,
            origin: originCoord
        };

        originConverter.forward = function (coord) {
            const fixedCoord = [
                coord[0] + this.origin[0],
                coord[1] + this.origin[1],
                coord[2] + this.origin[2]
            ];
            return this.converter.forward(fixedCoord);
        };

        //Logger.info(originConverter);

        return originConverter;
    }
}