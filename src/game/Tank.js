import { PhysicsAggregate, PhysicsBody, PhysicsShapeType, Quaternion, SceneLoader, Space, Texture, Tools, Vector2, Vector3 } from "@babylonjs/core";
import GameObject from "./GameObject";
import AssetMan from "./AssetMan";
import { gscene } from "./Global";
import { Bus, EVT_ADDSHADOW, EVT_DEBUG, EVT_DEBUGLINE, EVT_DEBUGVEC, EVT_PLAY3DAUDIO } from "./Bus";
import CControlSurfaces from "./CControlSurfaces";
import IVehicle from "./IVehicle";
import CBulletManager from "./BulletMan";

class Tank extends IVehicle {

    _throttle = 0;
    _power = 5;
    _pitch = 0;
    _pitchrate = 1;
    _roll = 0;
    _rollrate = 0.5;
    _yaw = 0;
    _yawrate = 1.15;
    _playercontrolled = false;

    _canPitch = 0;
    _controlSurfaces = null;

    _turret = null;
    _turretTurnRate = 1;
    _targetTurretRotation = Quaternion.Identity();
    _gun1 = null; q

    _fire1 = false;
    _hasFired = false;

    setup() {
        this._minThrottle = -0.5;
        const oldmesh = this._mesh;

        const task = AssetMan.getInstance()._assetman.addMeshTask(this._go.name, "", "assets/", this._go.file);
        task.onSuccess = (loadedFile) => {
            this._fileContents = loadedFile;
            this.afterLoadedTasks(loadedFile.loadedMeshes);
            loadedFile.loadedMeshes.forEach((mesh) => {
                
                if (mesh.name === "Turret") {
                    this._turret = mesh;
                }
                if (mesh.name === "Gun1") {
                    this._gun1 = mesh;
                }

                if (mesh.name === "Collision") {
                    this._mesh = mesh;
                    this._mesh.scaling = new Vector3(0.2, 0.2, 0.2);
                    mesh.isVisible = false;
                    this._mesh.position = new Vector3(-this._go.position[0], this._go.position[1], this._go.position[2]);
                    mesh.aggregate = new PhysicsAggregate(mesh, PhysicsShapeType.MESH, { mass: this._go.mass || 0.5, restitution: 0.4, friction: 0.9, linearDamping: 1, staticFriction: 0.1 }, this.scene);
                    mesh.aggregate.body.disablePreStep = false;
                    mesh.aggregate.body.setLinearDamping(1);
                    //mesh.aggregate.transformNode.setAbsolutePosution(new Vector3(this._go.position[0], this._go.position[1], this._go.position[2]));
                    //mesh.aggregate.transformNode.position.set(this._go.position[0], this._go.position[1], this._go.position[2]);
                    mesh.aggregate.transformNode.rotationQuaternion.set(this._go.rotation[0], this._go.rotation[1], this._go.rotation[2], this._go.rotation[3]);
                    mesh.aggregate.body.setCollisionCallbackEnabled(true);
                    this._aggregate = mesh.aggregate;
                } else {
                    mesh.receiveShadows = true;
                    Bus.send(EVT_ADDSHADOW, mesh);

                }
            });

            //this._mesh = task.loadedMeshes[0];

            if (oldmesh !== undefined) {
                oldmesh.dispose();
            }
            //this._mesh.rotation.x = Math.PI / 4.1;
            //this._mesh.rotation.z = Math.PI / 4.1;
            //this._aggregate = new PhysicsAggregate(this._mesh, PhysicsShapeType.BOX, { mass: 1 }, gscene);
            this._loaded = true;
        };
        task.onError = function (task) {
            console.error("Error loading aircraft", task);
        };

    }

    pulse() {
        if (this._isNPC) {
            return;
        }


        if (this._aggregate !== undefined) {
            this._speed = this._aggregate.body.getLinearVelocity().length();
            this._canPitch = Math.min(1, this._speed / 8);
            this._canRoll = Math.min(1, this._speed / 8);
            this._aggregate.body.applyForce(this._mesh.forward.scale(-this._throttle * this._power), this._mesh.getAbsolutePosition().add(this._mesh.forward.scale(-2)));

            this._fire1 && this._aggregate.body.applyForce(this._mesh.up.scale(4 * this._throttle), this._mesh.getAbsolutePosition());
            //this._aggregate.body.applyForce(this._mesh.up.scale(this._pitch * 10), this._mesh.getAbsolutePosition());
            this._aggregate.body.setAngularVelocity(this._mesh.up.scale(this._roll * this._rollrate));
        }

        //this._turret.rotation.set([0, this._yaw * 180, 0]);
        //this._turret.rotationQuaternion = Quaternion.RotationAxis(new Vector3(0, 1, 0), this._yaw * 0.5 + Math.PI);
    }

    setInputs(delta, pitch, roll, yaw, throttle, mouseTarget, fire1) {
        this._pitch = pitch;
        this._roll = roll;
        this._yaw += yaw * this._yawrate * delta;
        this._throttle = throttle + pitch;

        if (mouseTarget?.hit) {
            this.pointTurretAtTarget(mouseTarget.pickedPoint, delta);
        }

        if (fire1) {
            if (!this._hasFired) {
                this.fire();
            }
        } else {
            this._hasFired = false;
        }
    }

    fire() {
        // if (!this._hasFired) {
        this._hasFired = true;
        Bus.send(EVT_PLAY3DAUDIO, { name: "a_tank_firing.mp3", mesh: this._mesh, volume: 0.70 });
        CBulletManager.fireBullet(this._gun1);
        //}
        //   this._hasFired = false;
    }

    /**
     * Turn the tank body to point at the target
     * @param {*} target 
     * @param {*} delta 
     * @returns 
     */
    pointBodyAtTarget(target, delta) {
        if (!this._loaded) {
            return;
        };
        this._mesh.computeWorldMatrix(true);
        const vecd = this._mesh.getAbsolutePosition().subtract(target);
        const angle = Vector3.GetAngleBetweenVectorsOnPlane(vecd, this._mesh.forward, Vector3.Up());
        this._roll = angle < 0 ? -1 : 1;
        this._aggregate.body.setAngularVelocity(this._mesh.up.scale(this._roll * this._rollrate));
    }

    /**
     * 
     * @param {*} target Vector
     * @param {*} delta time delta
     */
    pointTurretAtTarget(target, delta, correction = 0.19) {
        if (!this._loaded) {
            return;
        };
        this._mesh.computeWorldMatrix(true);
        const v1 = this._mesh.getAbsolutePosition();
        const v2 = target.subtract(v1);
        //v2.y = 0;
        //v1.y = 0;
        v1.normalize();
        v2.normalize();
        const angle = Vector3.GetAngleBetweenVectorsOnPlane(v2, v1, Vector3.Up())
        if (isNaN(angle)) {
            return;
        }
        //Bus.send(EVT_DEBUG, "Angle: " + angle);

        const yrot = this._mesh.rotationQuaternion.toEulerAngles().y;
        this._targetTurretRotation = Quaternion.RotationAxis(new Vector3(0, 1, 0), -Math.PI/2 + angle - correction - yrot);
        this._turret.rotationQuaternion = Quaternion.Slerp(this._turret.rotationQuaternion, this._targetTurretRotation, this._turretTurnRate * delta);

        this._gun1.computeWorldMatrix(true);
        let vdeltaAngle = Math.atan2(target.y - this._gun1.getAbsolutePosition().y, this._gun1.getAbsolutePosition().y);
        this._gun1.rotationQuaternion = Quaternion.Slerp(this._gun1.rotationQuaternion, Quaternion.RotationAxis(new Vector3(1, 0, 0), vdeltaAngle), this._turretTurnRate * delta);
        // draw debug line along turrent
        //Bus.send(EVT_DEBUGLINE, { from: this._turret.getAbsolutePosition(), to: target });

    }
}

export default Tank;