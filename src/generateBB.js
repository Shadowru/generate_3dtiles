import * as turf from "@turf/turf";

const transformation = require('transform-coordinates')

const transform = transformation('EPSG:4326', 'EPSG:4326') // WGS 84 to Soldner Berlin

console.error(transform.forward({x: 0.6988424218, y: -1.3197209591796106}))

var poly = turf.bboxPolygon(
    [turf.radiansToDegrees(-1.3197209591796106),
        turf.radiansToDegrees(0.6988424218),
        turf.radiansToDegrees(-1.3196390408203893),
        turf.radiansToDegrees(0.6989055782)
    ]
);

console.log(JSON.stringify(poly));
