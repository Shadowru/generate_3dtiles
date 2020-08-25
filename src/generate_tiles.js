import ThreeDTilesGenerator from './ThreeDTilesGenerator'
import Logger from "js-logger";

Logger.useDefaults({
    defaultLevel: Logger.DEBUG
});


const optionDefinitionsPlant = [
    {name: 'depth', alias: 'd', type: Number, defaultValue: 3},
    {name: 'geo_error', alias: 'e', type: Number, defaultValue: 17},
    {name: 'mxfile', type: String, defaultValue: './data/Plant/plant.3mx'}
];

const optionHelsinkiCity = [
    {name: 'depth', alias: 'd', type: Number, defaultValue: 5},
    {name: 'geo_error', alias: 'e', type: Number, defaultValue: 0},
    {name: 'mxfile', type: String, defaultValue: './data/Helsinki/Helsinki3D-MESH_CityCenter-FixedSRS.3mx'}
];

const optionDefinitionsArma = [
    {name: 'depth', alias: 'd', type: Number, defaultValue: 12},
    {name: 'geo_error', alias: 'e', type: Number, defaultValue: 22},
    {name: 'mxfile', type: String, defaultValue: './data/arma_11_2019/ARMA_11.2019.3mx'}
];

const optionRaion21City = [
    {name: 'depth', alias: 'd', type: Number, defaultValue: 3},
    {name: 'geo_error', alias: 'e', type: Number, defaultValue: 50},
    {name: 'mxfile', type: String, defaultValue: './data/raion21/20191016_raion21.3mx'}
];

const optionRaion45City = [
    {name: 'depth', alias: 'd', type: Number, defaultValue: 9},
    {name: 'geo_error', alias: 'e', type: Number, defaultValue: 70},
    {name: 'mxfile', type: String, defaultValue: './data/raion45/20191017_raion45.3mx'}
];


const commandLineArgs = require('command-line-args');
const options = commandLineArgs(optionDefinitionsArma);

const dataCatalog = options.src;

const threeMXFileName = options.mxfile;

const depth = options.depth;

const geo_error = options.geo_error;

const generator = new ThreeDTilesGenerator(
    {
        dataCatalog: dataCatalog,
        threeMXFile: threeMXFileName,
        depth: depth,
        geometricError: geo_error,
        download: true
    });

generator.proceed('./tmp/tiles/')
