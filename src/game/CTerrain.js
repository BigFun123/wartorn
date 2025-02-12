import { Color3, Color4, Matrix, Mesh, MeshBuilder, PhysicsAggregate, PhysicsShapeType, SimplificationSettings, SimplificationType, Sprite, SpriteManager, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { AllLayers, CombinedBitmask, gplayer, gscene, PrimaryLayer, SecondaryLayer } from "./Global";
import stateInstance from "./State";
import { Bus, EVT_KEYDOWN } from "./Bus";
import earcut from 'earcut';

export class CTerrain {
    tilesize = 1000;
    heightScale = 0.22;
    heightOffset = 9;
    numTiles = 2;
    tiles = {};
    terrainServer = "http://localhost:3000";
    treemat = null;
    spriteManager = null;
    debug = false;
    zoom = 14;
    treeSize = 25;

    constructor(gx, gy, numTiles = 3) {
        this.gx = gx;
        this.gy = gy;
        this.numTiles = numTiles;
        this.depths = {};
        if (this.debug) {
            console.warn("TERRAIN DEBUG MODE - NO PHYSICS OR TREES");
        }

        Bus.subscribe(EVT_KEYDOWN, (e) => {
            // if key == + then increment the layermask for each tile.plane
            if (e.code === "NumpadAdd") {
                for (let key in this.tiles) {
                    this.tiles[key].plane.layerMask += 1;
                    console.log(this.tiles[key].plane.layerMask);
                }
            }
        });
    }

    async setup() {

        this.fontData = await (await fetch("./fonts/Roboto_Bold.json")).json(); // load 

        this.spriteManager = new SpriteManager("treesManager", this.terrainServer + "/tree1.png", 50000, { width: 600, height: 581, samplingMode: 7, fogEnabled: true }, gscene);
        this.spriteManager.texture.updateSamplingMode(Texture.TRILINEAR_SAMPLINGMODE);



        this.treeMat = new StandardMaterial("tree", gscene);
        this.treeMat.diffuseTexture = new Texture(this.terrainServer + `/tree2.png`, gscene);
        this.treeMat.diffuseTexture.hasAlpha = true;
        this.treeMat.specularColor = new Color3(0, 0, 0);
        this.treeMat.useAlphaFromDiffuseTexture = true;

        // create a 3x3 grid of tiles
        for (let x = 0; x <= this.numTiles; x++) {
            for (let y = 0; y <= this.numTiles; y++) {
                this.createTile(x + this.gx, y + this.gy);
            }
        }
    }

    createTile(gx, gy) {
        const zoom = this.zoom;
        const x = gx - this.gx;
        const y = gy - this.gy;
        this.tiles[`${gx}_${gy}`] = { gx, gy, x, y, zoom };
        // create a 255 x 255 plane, with 255 subdivisions
        const plane = MeshBuilder.CreateGround(`${gx}_${gy}`, { width: this.tilesize + .02, height: this.tilesize + .02, subdivisions: 512, updatable: true }, gscene);
        plane.layerMask = AllLayers;
        plane.receiveShadows = true;
        this.tiles[`${gx}_${gy}`].plane = plane;

        plane.position = new Vector3((x) * this.tilesize, this.heightOffset, -y * this.tilesize);
        // load a webp image to use as a heighmap
        const rgbmat = new StandardMaterial("mat", gscene);
        const rgbtexture = new Texture(this.terrainServer + `/rgb/${zoom}/${gx}/${gy}.png`, gscene);
        this.tiles[`${gx}_${gy}`].rgb = rgbtexture;
        rgbmat.diffuseTexture = rgbtexture;
        rgbmat.emissiveTexture = rgbtexture;
        rgbmat.specularColor = new Color3(0.5, 0.5, 0.6);
        rgbmat.specularPower = 4;
        rgbtexture.mode = Texture.LINEAR_LINEAR_MIPLINEAR;

        this.createBigLabel(plane, gx, gy, x, y);

        const bumpTexture = new Texture(this.terrainServer + `/PackedDirt_N.jpg`, gscene);
        rgbmat.bumpTexture = bumpTexture;
        rgbmat.bumpTexture.isEnabled = true;
        rgbmat.bumpTexture.level = 0.6;
        rgbmat.bumpTexture.uScale = 50;
        rgbmat.bumpTexture.vScale = 50;
        //rgbmat.wireframe = true;        
        rgbtexture.wrapU = Texture.CLAMP_ADDRESSMODE;
        rgbtexture.wrapV = Texture.CLAMP_ADDRESSMODE;
        rgbtexture.uScale = 1.00;
        rgbtexture.vScale = 1.00;

        //const mat = new StandardMaterial("mat", gscene);
        const texture = new Texture(this.terrainServer + `/${zoom}/${gx}/${gy}_cont.webp`, gscene);
        this.tiles[`${gx}_${gy}`].depth = texture;
        //mat.diffuseTexture = texture;
        plane.material = rgbmat;
        // render wireframe
        // wait for the texture to load
        texture.onLoadObservable.addOnce(async () => {
            // get the image data from the texture
            const imageData = await texture.readPixels();
            //const imageData = context.getImageData(0, 0, texture.getSize().width, texture.getSize().height);
            // set the height of the plane
            const heightMap = new Float32Array(514 * 514);
            for (let i = 0; i < 514; i++) {
                for (let j = 0; j < 514; j++) {
                    // the height data is stored in the rgb as a 24 bit number
                    // we need to convert it to a 24 bit number
                    const r = imageData[(i * 513 + j) * 4];
                    const g = imageData[(i * 513 + j) * 4 + 1];
                    const b = imageData[(i * 513 + j) * 4 + 2];
                    const a = imageData[(i * 513 + j) * 4 + 3];

                    heightMap[i * 513 + j] = -10000 + ((r * 256 * 256 + g * 256 + b) * 0.1);
                }
            }
            // set the height of the plane
            plane.updateMeshPositions((positions) => {
                let offset = 0;
                for (let i = 0; i < 513; i++) {
                    for (let j = 0; j < 513; j++) {
                        offset = 0;
                        if (heightMap[(i) * 513 + j] < -1) offset = -10
                        positions[(((513 - i) * 513 + j) * 3 + 1)] = heightMap[(i) * 513 + j] * this.heightScale + offset;
                    }
                }

                // clean up edge
                for (let i = 0; i < 514; i++) {
                    for (let j = 0; j < 513; j++) {
                        if (i == 0 && j < 513) {
                            positions[(((513 - i) * 513 + j) * 3 + 1)] = positions[(((513 - i) * 513 + j) * 3 + 1)];
                        }
                        if (i == 0 && j == 0) {
                            positions[(((513 - i) * 513 + j) * 3 + 1)] = positions[(((513 - i) * 513 + j) * 3 + 1)] * 2;
                        }
                        if (i == 513 && j < 513) {
                            positions[(((513 - i) * 513 + j) * 3 + 1)] = positions[(((514 - i) * 513 + j) * 3 + 1)];
                        }
                    }
                }
            });

            // simplify the geometry of plane
            let simplificationSettings = new SimplificationSettings(0.5, 10000, true);
            this.plantTrees(gx, gy);
            //this.createPhysics(gx, gy);

            // Apply the simplification
            //plane.simplify([simplificationSettings], false, SimplificationType.QUADRATIC, function () {
            //  console.log("Simplification complete!");

            //});

        });
    }

    /**
     * Create a big 3d text label for the plane
     * @param {*} plane 
     * @param {*} gx 
     * @param {*} gy 
     * @param {*} x 
     * @param {*} y 
     */
    createBigLabel(plane, gx, gy, x, y) {
        const text = MeshBuilder.CreateText(
            "myText",
            "T " + gx + "," + gy + ", " + x + "," + y,
            this.fontData,
            {
                size: 16,
                resolution: 64,
                depth: 10,
            },
            gscene,
            earcut
        );
        text.position = new Vector3((plane.position.x), 60, plane.position.z);
        // create a line to the origin of the plane
        const line = MeshBuilder.CreateLines("line", { points: [text.position, plane.position] }, gscene);
    }

    createPhysics(gx, gy) {
        this.tiles[`${gx}_${gy}`].aggregate = new PhysicsAggregate(this.tiles[`${gx}_${gy}`].plane, PhysicsShapeType.MESH, { mass: 0, restitution: 0.4, friction: 1.1, linearDamping: 0.5 }, gscene);
    }


    pulse(delta) {
        const pos = gplayer._craft.getPosition();
        if (!pos) {
            return;
        }

        // calculate which tile the player is over
        const xx = Math.floor(pos.x / this.tilesize);
        const yy = Math.floor(-pos.z / this.tilesize);
        gplayer.tileX = this.gx + xx + 1;
        gplayer.tileY = this.gy + yy + 1;
        // if the player is over a new tile, create a new tile
        // if (!this.tiles[`${gplayer.tileX}_${gplayer.tileY}`]) {
        //     this.createTile(gplayer.tileX, gplayer.tileY, xx, yy, 14);
        // }
        const tile = this.tiles[`${gplayer.tileX}_${gplayer.tileY}`];
        if (!tile.aggregate) {
            this.createPhysics(gplayer.tileX, gplayer.tileY);
        }

        // for (let x = -1; x < 2; x++) {
        //     for (let y = -1; y < 2; y++) {
        //         if (!this.tiles[`${gplayer.tileX + x}_${gplayer.tileY + y}`]) {
        //             this.createTile(gplayer.tileX + x, gplayer.tileY + y, xx+x, yy+y, 14);
        //         }
        //         if (!this.tiles[`${gplayer.tileX + x}_${gplayer.tileY + y}`]?.aggregate) {
        //             this.createPhysics(gplayer.tileX + x, gplayer.tileY + y);
        //             this.plantTrees(gplayer.tileX + x, gplayer.tileY + y);
        //         }
        //     }
        // }

        // if (!this.tiles[`${gplayer.tileX}_${gplayer.tileY}`].aggregate) {
        //     this.createPhysics(gplayer.tileX, gplayer.tileY);
        //     this.plantTrees(gplayer.tileX, gplayer.tileY);
        // }

        // if (!this.tiles[`${gplayer.tileX}_${gplayer.tileY}`]) {
        //     this.createTile(gplayer.tileX, gplayer.tileY, xx, yy, 14);
        // }
        // if (!this.tiles[`${gplayer.tileX + 1}_${gplayer.tileY}`]) {
        //     this.createTile(gplayer.tileX + 1, gplayer.tileY, xx + 1, yy, 14);
        // }
        // if (!this.tiles[`${gplayer.tileX + 1}_${gplayer.tileY + 1}`]) {
        //     this.createTile(gplayer.tileX + 1, gplayer.tileY + 1, xx + 1, yy + 1, 14);
        // }
        // if (!this.tiles[`${gplayer.tileX}_${gplayer.tileY + 1}`]) {
        //     this.createTile(gplayer.tileX, gplayer.tileY + 1, xx, yy + 1, 14);
        // }

    }

    /**
     * Add instance trees wherever there is a green pixel on the landuse map
     * @param {*} x 
     * @param {*} y 
     */
    plantTrees(gx, gy) {
        const tile = this.tiles[`${gx}_${gy}`];
        const landuseTex = new Texture(this.terrainServer + `/landuse/14/${gx}/${gy}.png`, gscene);
        this.tiles[`${gx}_${gy}`].landuse = landuseTex;
        //this.tiles[`${gx}_${gy}`].plane.material.diffuseTexture = landuseTex;
        tile.landuse.onLoadObservable.addOnce(async () => {
            //const tree = MeshBuilder.CreateCylinder("tree", { height: 3, diameterTop: 0, diameterBottom: 3 }, gscene);
            //const tree = MeshBuilder.CreatePlane("tree", { width: 3, height: 3 }, gscene);

            //
            //tree.billboardMode = Mesh.BILLBOARDMODE_Y;

            const imageData = await landuseTex.readPixels();

            const positions = tile.plane.getVerticesData("position");

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

                    // tile.plane.updateMeshPositions((positions) => {
                    //     if (g < 100 && r < 100 && b > 200) {
                    //         positions[(((512 - i) * 513 + j) * 3) + 1] += 50;
                    //     } else {
                    //         positions[(((512 - i) * 513 + j) * 3) + 1] -= 5;
                    //     }
                    // });



                    //if (counter > 10000) return;
                    const rnd = Math.random() < 0.25;
                    if (g > 200 && r < 100 && b < 100 && rnd) {
                        // plant a tree
                        const rnd = Math.random() * this.treeSize + 1.5;
                        let posx = tile.plane.position.x + positions[(((512 - i) * 513 + j) * 3) + 0] + Math.random() * 5;
                        let posy = tile.plane.position.y + positions[(((512 - i) * 513 + j) * 3) + 1] + rnd/2;
                        let posz = tile.plane.position.z + positions[(((512 - i) * 513 + j) * 3) + 2] + Math.random() * 5;

                        //var matrix = Matrix.Translation(posx, posy, posz);
                        // scale randomly
                        //matrix = matrix.multiply(Matrix.Scaling(Math.random() * 0.5 + 0.5));
                        //const instance = tree.thinInstanceAdd(matrix);                        
                        //instance.billboardMode = 7;
                        const tree = new Sprite("tree", this.spriteManager);
                        tree.color = new Color4(0.65, 0.65, 0.65, 1);
                        tree.position = new Vector3(posx, posy, posz);
                        tree.size = rnd;
                    }


                }
            }
        });
    }


}