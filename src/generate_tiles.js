import ThreeDTilesGenerator from './ThreeDTilesGenerator'
import Logger from "js-logger";

Logger.useDefaults({
    defaultLevel: Logger.INFO
});


const optionDefinitionsPlant = [
    {name: 'depth', alias: 'd', type: Number, defaultValue: 4},
    {name: 'mxfile', type: String, defaultValue: './data/Plant/plant.3mx'}
];

const optionHelsinkiCity = [
    {name: 'depth', alias: 'd', type: Number, defaultValue: 6},
    {name: 'mxfile', type: String, defaultValue: './data/Helsinki/Helsinki3D-MESH_CityCenter.3mx'}
];

const optionDefinitionsArma = [
    {name: 'depth', alias: 'd', type: Number, defaultValue: 7},
    {name: 'mxfile', type: String, defaultValue: './data/arma_11_2019/ARMA_11.2019.3mx'}
];

const optionRaion21City = [
    {name: 'depth', alias: 'd', type: Number, defaultValue: 8},
    {name: 'mxfile', type: String, defaultValue: './data/raion21/20191016_raion21.3mx'}
];

const optionRaion45City = [
    {name: 'depth', alias: 'd', type: Number, defaultValue: 7},
    {name: 'mxfile', type: String, defaultValue: './data/raion45/20191017_raion45.3mx'}
];


const commandLineArgs = require('command-line-args');
const options = commandLineArgs(optionDefinitionsPlant);

const dataCatalog = options.src;

const threeMXFileName = options.mxfile;

const depth = options.depth;

const generator = new ThreeDTilesGenerator(
    {
        dataCatalog: dataCatalog,
        threeMXFile: threeMXFileName,
        depth: depth,
        download: true
    });

generator.proceed('./tmp/tiles/')
