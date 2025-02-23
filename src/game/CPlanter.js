import { Color4, Sprite, SpriteManager, Texture, Vector3 } from "@babylonjs/core";
import { gscene } from "./Global";

/** plant trees, grass, on a mesh */
class CPlanter {

    spriteManager = null;
    treeSize = 35;

    constructor(treepath) {
        this.spriteManager = new SpriteManager("treesManager", treepath, 50000, { width: 600, height: 581, samplingMode: 7, fogEnabled: true }, gscene);
        this.spriteManager.texture.updateSamplingMode(Texture.TRILINEAR_SAMPLINGMODE);
    }

    plantTrees(mesh, density, landusetexname) {
        const landuseTex = new Texture(landusetexname, gscene);

        landuseTex.onLoadObservable.addOnce(async () => {
            const imageData = await landuseTex.readPixels();
            const positions = mesh.getVerticesData("position");

            const size = landuseTex.getSize();
            let counter = 0;
            for (let i = 0; i < size.width - 3; i += 3) {
                for (let j = 0; j < size.height - 3; j += 3) {
                    // get the pixel from imageData, if it's green, plant a tree
                    counter++;

                    const r = imageData[(i * size.width + j) * 4];
                    const g = imageData[(i * size.width + j) * 4 + 1];
                    const b = imageData[(i * size.width + j) * 4 + 2];
                    const a = imageData[(i * size.width + j) * 4 + 3];


                    //if (counter > 10000) return;
                    const rnd = Math.random() < density;
                    if (g > 200 && r < 100 && b < 100 && rnd) {
                        // plant a tree
                        const trnd = Math.random() * this.treeSize + 4.5;
                        let posx = mesh.position.x + positions[(((512 - i) * 513 + j) * 3) + 0] + Math.random() * 5;
                        let posy = mesh.position.y + positions[(((512 - i) * 513 + j) * 3) + 1] + trnd/2.1;
                        let posz = mesh.position.z + positions[(((512 - i) * 513 + j) * 3) + 2] + Math.random() * 5;

                        //var matrix = Matrix.Translation(posx, posy, posz);
                        // scale randomly
                        //matrix = matrix.multiply(Matrix.Scaling(Math.random() * 0.5 + 0.5));
                        //const instance = tree.thinInstanceAdd(matrix);                        
                        //instance.billboardMode = 7;
                        const tree = new Sprite("tree", this.spriteManager);
                        tree.color = new Color4(0.65, 0.65, 0.65, 1);
                        tree.position = new Vector3(posx, posy, posz);
                        tree.size = trnd;
                    }
                }
            }
        });
        return landuseTex;
    }
}

export default CPlanter;