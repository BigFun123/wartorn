import { Color3, Color4, Matrix, Mesh, MeshBuilder, PhysicsAggregate, PhysicsShapeType, SimplificationSettings, SimplificationType, Sprite, SpriteManager, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { AllLayers, CombinedBitmask, gplayer, gscene, PrimaryLayer, SecondaryLayer, tilesize } from "./Global";
import stateInstance from "./State";
import { Bus, EVT_KEYDOWN, EVT_PLAYERLOADED } from "./Bus";
import earcut from 'earcut';
import { xyToTile } from "./Utils";
import CPlanter from "./CPlanter";



export class CTerrain {

    heightScale = 0.22;
    heightOffset = 9;
    numTiles = 2;
    tiles = {};
    terrainServer = "http://localhost:3000";
    treemat = null;    
    debug = false;
    zoom = 14;
    
    _enabled = false;
    _planter = null;

    constructor(gx, gy, numTiles = 3) {
        this.gx = gx;
        this.gy = gy;
        this.numTiles = numTiles;
        this.depths = {};
        this.tilesize = tilesize;
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

        Bus.subscribe(EVT_PLAYERLOADED, (data) => {
            this._enabled = true;
            this.setupTiles();
        });
    }

    static xyToTile(x, y) {
        return [Math.floor(x / tilesize), Math.floor(y / tilesize)];
    }

    async setup() {

        this.fontData = await (await fetch("./fonts/Roboto_Bold.json")).json(); // load 
        this._planter = new CPlanter(this.terrainServer + "/tree1.png");

        // this.treeMat = new StandardMaterial("tree", gscene);
        // this.treeMat.diffuseTexture = new Texture(this.terrainServer + `/tree2.png`, gscene);
        // this.treeMat.diffuseTexture.hasAlpha = true;
        // this.treeMat.specularColor = new Color3(0, 0, 0);
        // this.treeMat.useAlphaFromDiffuseTexture = true;

        this.createBumpTexture();
        

        // create a 3x3 grid of tiles
        //for (let x = 0; x <= this.numTiles; x++) {
            //for (let y = 0; y <= this.numTiles; y++) {
                this.createTile(this.gx, this.gy);
          //  }
        //}
    }

    createBumpTexture() {
        this.bumpTexture = new Texture(this.terrainServer + `/PackedDirt_N.jpg`, gscene);
        this.bumpTexture.isEnabled = true;
        this.bumpTexture.level = 2.6;
        this.bumpTexture.uScale = 50;
        this.bumpTexture.vScale = 50;
    }

    createTile(gx, gy) {
        const zoom = this.zoom;
        const x = gx - this.gx;
        const y = gy - this.gy;
        this.tiles[`${gx}_${gy}`] = { gx, gy, x, y, zoom };
        // create a 255 x 255 plane, with 255 subdivisions
        const plane = MeshBuilder.CreateGround(`Tile_${gx}_${gy}`, { width: this.tilesize + .02, height: this.tilesize + .02, subdivisions: 512, updatable: true }, gscene);
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
        rgbmat.specularColor = new Color3(0.25, 0.25, 0.26);
        rgbmat.specularPower = 4;
        rgbtexture.mode = Texture.LINEAR_LINEAR_MIPLINEAR;

        this.createBigLabel(plane, gx, gy, x, y);

        
        rgbmat.bumpTexture = this.bumpTexture;
        
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
            this.createPhysics(gx, gy);

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

    setupTiles() {
        for (let x = -1; x < 3; x++) {
            for (let y = -1; y < 3; y++) {
                if (!this.tiles[`${gplayer.tileX + x}_${gplayer.tileY + y}`]) {
                    this.createTile(gplayer.tileX + x, gplayer.tileY + y);
                    this.plantTrees(gplayer.tileX + x, gplayer.tileY + y);
               }
           }
       }
    }


    async pulse(delta) {
        const pos = gplayer?._craft?.getPosition();
        if (!pos || !this._enabled) {
            return;
        }


        // calculate which tile the player is over
        const tilePos = xyToTile(pos.x, pos.z, tilesize);
        gplayer.tileX = tilePos[0] + this.gx + 1;
        gplayer.tileY = tilePos[1] + this.gy + 1;
  

         for (let x = -1; x < 1; x++) {
             for (let y = -1; y < 1; y++) {
                 if (!this.tiles[`${gplayer.tileX + x}_${gplayer.tileY + y}`]) {
                     this.createTile(gplayer.tileX + x, gplayer.tileY + y);
                     this.plantTrees(gplayer.tileX + x, gplayer.tileY + y);
                }
                //if (!this.tiles[`${gplayer.tileX + x}_${gplayer.tileY + y}`]?.aggregate) {
                    //this.createPhysics(gplayer.tileX + x, gplayer.tileY + y);
                    
                //}
            }
        }

        //  if (!this.tiles[`${gplayer.tileX}_${gplayer.tileY}`]) {
        //      await this.createTile(gplayer.tileX, gplayer.tileY);
        //      await this.plantTrees(gplayer.tileX, gplayer.tileY);
        //      //this.createPhysics(gplayer.tileX, gplayer.tileY);
        //  }

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
        const landusetextfile = this.terrainServer + `/landuse/14/${gx}/${gy}.png`;
        this.tiles[`${gx}_${gy}`].landuse = this._planter.plantTrees(tile.plane, 0.12, landusetextfile);        
    }


}