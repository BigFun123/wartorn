import { Color3, GPUPicker, Matrix, MeshBuilder, Quaternion, StandardMaterial } from "@babylonjs/core";
import { gscene, setCursor } from "./Global";
import { Bus, EVT_CURSOR3D, EVT_DEBUG, EVT_DEBUGVEC, EVT_KEYUP, EVT_MOUSEUP } from "./Bus";

export default class CCursor {

    _enabled = true;
    _previousX = 0;
    _previousY = 0;

    constructor() {
        this._cursor = null;
    }

    setup() {
        // this._cursor = MeshBuilder.CreatePlane("target", { width: 0.5, height: 22 }, gscene);                
        // this._cursor2 = MeshBuilder.CreatePlane("target", { width: 22, height: 0.5 }, gscene);                        
        // this._cursor.material = new StandardMaterial("target", gscene);
        // this._cursor.material.emissiveColor = new Color3(0, 1, 0);
        // this._cursor2.setParent(this._cursor);
        // this._cursor2.material = this._cursor.material;
        // this._cursor.isVisible = false;
        // this._cursor2.isVisible = false;

        //this.cursor.material.diffuseTexture = new Texture(CSettings.settings.assetsFolder + "/textures/target_green.png", scene);
        //this.cursor.material.emissiveTexture = new Texture(CSettings.settings.assetsFolder + "/textures/target_green.png", scene);
        //this.cursor.material.diffuseTexture.hasAlpha = true;
        //this.cursor.material.diffuseTexture.lightingEnabled = false;
        //this._cursor.renderingGroupId = 1;
        //this.physics = scene.getPhysicsEngine();
        // this._cursor.rotationQuaternion = Quaternion.Identity();


        this._cursor = MeshBuilder.CreateSphere("cursor", { diameter: 0.1 }, gscene);
        this._cursor.material = new StandardMaterial("target", gscene);
        this._cursor.material.emissiveColor = new Color3(0, 1, 0);
        this._cursor.isVisible = false;

        setCursor(this);

        //var picker = new GPUPicker();
        //picker.setPickingList(gscene.meshes);

        Bus.subscribe(EVT_MOUSEUP, e => {
            console.log(this._cursor.position);           
        })

        Bus.subscribe(EVT_KEYUP, e => {
            if (e.code == "NumpadDecimal") {
                this._enabled = true;                
            }
            if (e.code === "Numpad0") {
                // create a cube at the cursor position
                let cube = MeshBuilder.CreateBox("cube", { size: 0.1 }, gscene);
                cube.position = this._cursor.position;
                cube.material = new StandardMaterial("cube", gscene);
                cube.material.diffuseColor = new Color3(1, 0, 0);
                cube.material.specularColor = new Color3(0, 0, 0);
                cube.material.emissiveColor = new Color3(1, 0, 0);
                Bus.send(EVT_DEBUGVEC, this._cursor.position);
            }   
            if (e.code === "Numpad5") {

            }
        })

        //gscene.onPointerMove = (evt, pickInfo) => {
        gscene.onBeforeRenderObservable.add(() => {
            if (this._enabled) {
                if (gscene.activeCamera) {
                    let ray = gscene.createPickingRay(gscene.pointerX, gscene.pointerY, Matrix.Identity(), gscene.activeCamera, false);                    
                    let hit = gscene.pickWithRay(ray, (mesh)=> {
                        //todo filter out hi def terrain meshes
                        if (mesh.name.startsWith("Tile_") || mesh.name.startsWith("line")) {
                            return false;
                        }
                        return true;
                    });
                    if (hit.hit) {
                        //this._cursor.position = hit.hitPointWorld.add(hit.hitNormalWorld.scale(0.1));
                        this._cursor.position = hit.pickedPoint;
                       // this._cursor.isVisible = true;
                        //Bus.send(EVT_DEBUG, hit.pickedPoint.x.toFixed(2) + "," + hit.pickedPoint.y.toFixed(2) + "," + hit.pickedPoint.z.toFixed(2));
                    }
                    Bus.send(EVT_CURSOR3D, hit);
                }
            }
        });

    }
}