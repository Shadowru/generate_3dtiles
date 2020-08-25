import {Stream} from "./CTM";

import * as fs from "fs";

const data = fs.readFileSync('../tmp/0agl9d.ctm')

const  stream = Stream(data)