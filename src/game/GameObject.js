import { MeshBuilder, PhysicsAggregate, PhysicsShapeType, Vector3 } from "@babylonjs/core";
import { gscene } from "./Global";
import Render from "./Render";
import { Bus, EVT_ADDSHADOW, EVT_ERROR, EVT_REMOVESHADOW } from "./Bus";
import AssetMan from "./AssetMan";

class GameObject {
    _aggregate;
    _mesh;
    _initialPosition;
    _go;
    _hasCollision = false;
    _loaded = false;
    _isNPC = false;

    constructor(go) {
        this._go = go;
        this.presetup();
    }

    presetup() {
        this._mesh = MeshBuilder.CreateBox("box", { size: 1 }, gscene);
        this._mesh.position.set(this._go.position);
        // Move the box upward 1/2 its height
        //this._mesh.position.y = 2.5;
        //this._mesh.rotation.x = Math.PI / 4.1;
        //this._mesh.rotation.z = Math.PI / 4.1;
    }

    setup() {
    }

    afterLoadedTasks(meshes) {
        meshes.forEach((mesh) => {
            if (mesh.name === "__root__") {
                mesh.name = this._go.name || "__root__";
            }
        });
    }

    loadHDTextures() {
        if (!this._go.texture) {
            return;
        }
        const task = AssetMan.getInstance()._textureman.addTextureTask(this._go.name, "assets/" + this._go.normal, false, false);
        task.onSuccess = (task) => {
            this.setTexture(task.texture);
        };
        task.onError = (task) => {
            Bus.send(EVT_ERROR, "Error loading texture " + this._go.name + " : " + this._go.texture);
        };
    }
    setTexture(texture) {
        //this._mesh.material.albedoTexture = texture;    
        /*
        this._mesh.material.detailMap.texture = texture;    
        this._mesh.material.detailMap.isEnabled = true; 
        this._mesh.material.detailMap.uScale = 10;
        this._mesh.material.detailMap.vScale = 10;
        */
        // set normal map
        this._mesh.material.bumpTexture = texture;
        this._mesh.material.bumpTexture.level = 1;
        this._mesh.material.bumpTexture.uScale = 100;
        this._mesh.material.bumpTexture.vScale = 100;
    }

    reset() {
        if (this._go !== undefined) {
            if (this._mesh.parent) {
                this._mesh.parent?.position?.set(this._go.position[0], this._go.position[1], this._go.position[2]);
            } else {
                this._mesh.position.set(this._go.position);
            }

            if (this._aggregate !== undefined) {
                this._aggregate.body.disablePreStep = false;
                this._aggregate.transformNode.position.set(0, 0, 0);
                if (this._go.rotation) {
                    this._aggregate.transformNode.rotationQuaternion.set(this._go.rotation[0], this._go.rotation[1], this._go.rotation[2], this._go.rotation[3]);
                }

                //this._aggregate.body.position = this._mesh.position.clone();
                this._aggregate.body.setLinearVelocity(Vector3.Zero());
                this._aggregate.body.setAngularVelocity(Vector3.Zero());
            }
        }
    }

    saveInitialPosition() {
        if (this._mesh !== undefined) {
            this._initialPosition = this._mesh.position.clone();
        }
    }

    pulse() {
        if (this._aggregate !== undefined) {
            this._velocity = this._aggregate.body.getLinearVelocity();
        this._speed = this._velocity.length();
            //this._aggregate.body.applyForce(this._mesh.up, this._mesh.getAbsolutePosition());
        }
    }

    dispose() {
        Bus.send(EVT_REMOVESHADOW, this._mesh);
    }

}

export default GameObject;