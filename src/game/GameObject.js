import { MeshBuilder, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, Vector3 } from "@babylonjs/core";
import { gscene, PrimaryLayer, TertiaryLayer } from "./Global";
import Render from "./Render";
import { Bus, EVT_ADDSHADOW, EVT_DESTROYED, EVT_ERROR, EVT_REMOVESHADOW } from "./Bus";
import AssetMan from "./AssetMan";

class GameObject {
    _aggregate;
    _mesh;
    _initialPosition;
    _go;
    _hasCollision = false;
    _loaded = false;
    _isNPC = false;
    _fileContents = null;
    _isSetup = false;
    _health = 100;
    _disposed = false;
    _isMoveable = false;
    _team = "A";

    constructor(go) {
        this._go = go;
       
        this.presetup();
    }

    presetup() {
        this._initialPosition = new Vector3(this._go.position[0], this._go.position[1], this._go.position[2]);
        this._mesh = MeshBuilder.CreateBox(this._go.name || "box", { size: 1 }, gscene);
        this._mesh.position.set(this._go.position);
        this._mesh.rotationQuaternion = this._go.rotation ? new Vector3(this._go.rotation[0], this._go.rotation[1], this._go.rotation[2], this._go.rotation[3]) : Vector3.Zero();
        this._mesh.layerMask = PrimaryLayer;
        // Move the box upward 1/2 its height
        //this._mesh.position.y = 2.5;
        //this._mesh.rotation.x = Math.PI / 4.1;
        //this._mesh.rotation.z = Math.PI / 4.1;
    }

    getPosition() {
        return this._mesh.position;
    }

    setup() {
        const oldmesh = this._mesh;
        const task = AssetMan.getInstance()._assetman.addMeshTask(this._go.name, "", "assets/", this._go.file);
        task.onSuccess = (task) => {

            this.afterLoadedTasks(task.loadedMeshes);

            task.loadedMeshes.forEach((mesh) => {
                if (mesh.name === "Collision") {
                    this._hasCollision = true;
                }
            });

            if (this._hasCollision === false) {
                this._mesh = task.loadedMeshes[1];
                this._mesh.position = new Vector3(this._go.position[0], this._go.position[1], this._go.position[2]);
                this._mesh.scaling = new Vector3(0.1, 0.1, 0.1);
                this._aggregate = new PhysicsAggregate(this._mesh, PhysicsShapeType.MESH, { mass: 0 }, this.scene);
                this._mesh.checkCollisions = true;
            }


            task.loadedMeshes.forEach((mesh) => {
                if (mesh.name === "Collision") {
                    this._hasCollision = true;
                    this._mesh = mesh;
                    this._mesh.checkCollisions = true;
                    this._mesh.position = new Vector3(-this._go.position[0], this._go.position[1], this._go.position[2]);
                    this._mesh.scaling = new Vector3(0.1, 0.1, 0.1);
                    mesh.isVisible = false;
                    mesh.aggregate = new PhysicsAggregate(mesh, PhysicsShapeType.MESH, { mass: 0, restitution: 0.4, friction: 0.1, linearDamping: 0.5 }, this.scene);
                    if (this._isNPC) {
                        mesh.aggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);
                        mesh.aggregate.body.disablePreStep = false;
                    }
                    mesh.aggregate.body.disablePreStep = false;
                    //mesh.aggregate.transformNode.position.set(this._go.position[0], this._go.position[1], this._go.position[2]);
                    mesh.aggregate.body.setCollisionCallbackEnabled(true);
                    this._aggregate = mesh.aggregate;
                    mesh.receiveShadows = false;

                } else {
                    mesh.receiveShadows = true;
                    Bus.send(EVT_ADDSHADOW, mesh);

                }
            });

            if (oldmesh !== undefined) {
                oldmesh.dispose();
            }
            this.onLoaded();

        };
        task.onError = function (task) {
            console.error("Error loading mesh", task?._errorObject?.exception);
        };

    }

    // override
    onLoaded() {
        console.log("GameObject onLoaded");
    }

    afterLoadedTasks(meshes) {
        meshes.forEach((mesh) => {
            if (mesh.name === "__root__") {
                mesh.name = this._go.name || "__root__";
            }
        });
    }

    loadHDTextures() {
        if (!this._go.normal) {
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
            this.setPosition(this._initialPosition);

        }
    }

    setPosition(vector) {
        if (this._aggregate !== undefined) {
            this._aggregate.body.disablePreStep = false;
            this._aggregate.transformNode.position.set(this._go.position[0], this._go.position[1], this._go.position[2]);
            if (this._go.rotation) {
                this._aggregate.transformNode.rotationQuaternion.set(this._go.rotation[0], this._go.rotation[1], this._go.rotation[2], this._go.rotation[3]);
            }
            //this._aggregate.body.position = this._mesh.position.clone();
            this._aggregate.body.setLinearVelocity(Vector3.Zero());
            this._aggregate.body.setAngularVelocity(Vector3.Zero());
        } else {
            if (this._mesh.parent && this._mesh.parent.name !== "__root__") {
                this._mesh.parent?.position?.set(this._go.position[0], this._go.position[1], this._go.position[2]);
            } else {
                this._mesh.position.set(this._go.position);
            }
        }
    }

    saveInitialPosition() {
        if (this._mesh !== undefined) {
            this._initialPosition = this._mesh.position.clone();
        }
    }

    pulse() {
        // if (this._isMoveable && !this._disposed && this._aggregate !== undefined) {
        //     this._velocity = this._mesh._physicsBody.getLinearVelocity();
        //     this._speed = this._velocity.length();
        //     this._altitude = this._mesh.position.y;
        //     this._heading = this._mesh.rotationQuaternion.toEulerAngles().y * 180 / Math.PI;
        //     this._heading = this._heading < 0 ? Math.abs(this._heading) : 360 - this._heading;
        //     //this._aggregate.body.applyForce(this._mesh.up, this._mesh.getAbsolutePosition());
        // }
    }

    calculateSpeed() {
        if (this._isMoveable && !this._disposed && this._mesh.physicsBody !== undefined) {
            this._velocity = this._mesh._physicsBody.getLinearVelocity();
            this._speed = this._velocity.length();
            this._altitude = this._mesh.position.y;
            this._heading = this._mesh.rotationQuaternion.toEulerAngles().y * 180 / Math.PI;
            this._heading = this._heading < 0 ? Math.abs(this._heading) : 360 - this._heading;        
        }
    }

    dispose() {
        Bus.send(EVT_REMOVESHADOW, this._mesh);
        Bus.send(EVT_DESTROYED, this);
        this._aggregate?.dispose();
        this._mesh.dispose();
    }

    playFullAnim(name, speed, doneCallback) {
        this._fileContents?.loadedAnimationGroups?.forEach((anim) => {
            if (anim.name.toLowerCase() === name.toLowerCase()) {
                anim.loopAnimation = false;
                const startFrame = speed == -1 ? anim.to : anim.from;
                anim.goToFrame(startFrame);
                anim.weight = 1;
                anim.speedRatio = speed;
                anim.play(false);
                anim.onAnimationEndObservable.addOnce(() => {
                    doneCallback && doneCallback(anim);
                });
            }
        });
    }

    getCockpitCam() {
        //return the mesh named "CameraTarget"
        const mesh = this._fileContents.loadedMeshes.find((mesh) => {
            return mesh.name === "CockpitCam";
        });
        return mesh || this._mesh;
    }

    getCameraTarget() {
        const mesh = this._fileContents.loadedMeshes.find((mesh) => {
            return mesh.name === "CameraTarget";
        });
        return mesh || this._mesh;
    }

    // hide all meshes except the cockpit
    showCockpit(show) {
        this._fileContents.loadedMeshes.forEach((mesh) => {
            if (show) {
                mesh.isVisible = mesh.name === "Cockpit" ||
                    mesh?.parent?.name === "Cockpit" ||
                    mesh?.parent?.parent?.name === "Cockpit"
            } else {
                mesh.isVisible = mesh.name !== "Cockpit";
            }
            mesh.name === "Collision" && (mesh.isVisible = false);

            if (mesh.name === "Cockpit" || mesh?.parent?.name === "Cockpit" || mesh?.parent?.parent?.name === "Cockpit") {
                mesh.layerMask = TertiaryLayer;
            }
        });
    }

    onCollision(collider) {
        console.log("Collision with ", collider.collidedAgainst?.name);
        if (collider.collidedAgainst?.transformNode?.name === "bullet") {
            this._health -= 10;
            if (this._health <= 0) {
                this.dispose();
            }
        }
    }

    getAttribute(name) {
        if (this._go[name] === undefined) {
            console.error("Attribute " + name + " not found in GameObject");
            return 0;
        }
        return this._go[name];
    }

}

export default GameObject;