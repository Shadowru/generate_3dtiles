import {
    GLTFAsset, Scene, Node, Material, Texture, Mesh, Vertex, WrappingMode
} from "gltf-js-utils";

import {exportGLB, exportGLTF, BufferOutputType} from "gltf-js-utils";
import * as fs from "fs";


const asset = new GLTFAsset();
const scene = new Scene();
asset.addScene(scene);

const node = new Node();
node.setTranslation(0, 0, 0);
node.setRotationRadians(0, 0, 0);
node.setScale(1, 1, 1);
scene.addNode(node);

const material = new Material();
material.doubleSided = true;
material.pbrMetallicRoughness = {
    metallicFactor: 1.0,
    roughnessFactor: 1.0,
};


const mesh = new Mesh();
mesh.material = [material];

const v1 = new Vertex();
v1.x = 183.41391
v1.y = -120.35897
v1.z = 48.514404
v1.u = 0;
v1.v = 0;
v1.normalX = 0;
v1.normalY = 0;
v1.normalZ = -1;

const v2 = new Vertex();
v2.x = 183.41391;
v2.y = -43.745632;
v2.z = 48.514404;
v2.normalX = 0;
v2.normalY = 0;
v2.normalZ = -1;

const v3 = new Vertex();
v3.x = 259.48572;
v3.y = -43.745632;
v3.z = 48.514404
v3.normalX = 0;
v3.normalY = 0;
v3.normalZ = -1;

const v4 = new Vertex();
v4.x = 259.48572;
v4.y = -120.35897;
v4.z = 48.514404
v4.normalX = 0;
v4.normalY = 0;
v4.normalZ = -1;

mesh.addFace(v1, v2, v4, 0);
mesh.addFace(v2, v3, v4, 0);

node.mesh = mesh;
const gltfFiles = exportGLB(asset);

gltfFiles.then(
    result => {
        //console.log(result);
        fs.writeFileSync('../test.glb', Buffer.from(result));
    }
)


