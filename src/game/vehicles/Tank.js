import { Color3, MeshBuilder, Physics6DoFConstraint, PhysicsAggregate, PhysicsBody, PhysicsConstraintAxis, PhysicsConstraintMotorType, PhysicsMotionType, PhysicsShapeBox, PhysicsShapeCylinder, PhysicsShapeMesh, PhysicsShapeType, Quaternion, SceneLoader, Space, StandardMaterial, Texture, Tools, Vector2, Vector3, Vector4 } from "@babylonjs/core";
import AssetMan from "../AssetMan";
import { gscene } from "../Global";
import { Bus, EVT_ADDSHADOW, EVT_DEBUG, EVT_DEBUGLINE, EVT_DEBUGVEC, EVT_PLAY3DAUDIO } from "../Bus";
import CBulletManager from "../BulletMan";
import { CCar } from "./CCar";


class Tank extends CCar {

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
    _turretFake = null;

    _fire1 = false;
    _hasFired = false;
    _displayMesh = null;

    setup(assetman) {
        this.InitTyreMaterial();
        this._minThrottle = -0.5;
        this._isMoveable = true;
        const oldmesh = this._mesh;

        this._turretFake = MeshBuilder.CreateBox("turretFake", { width: 0.1, height: 0.1, depth: 2.1 }, gscene);
        this._turretFake.rotationQuaternion = Quaternion.FromEulerAngles(0, Math.PI, 0);

        const task = assetman ? assetman.addMeshTask(this._go.name, "", "assets/", this._go.file) :
            AssetMan.getInstance()._assetman.addMeshTask(this._go.name, "", "assets/", this._go.file);
        task.onSuccess = (loadedFile) => {
            this._fileContents = loadedFile;
            this.afterLoadedTasks(loadedFile.loadedMeshes);
            loadedFile.loadedMeshes.forEach((mesh) => {

                if (mesh.name === "Turret") {
                    this._turret = mesh;
                    //this._turret.parent = null;
                }
                if (mesh.name === "Gun1") {
                    this._gun1 = mesh;
                }

                if (mesh.name === "Collision") {
                    this._displayMesh = mesh;
                    mesh.parent = null;
                    mesh.isVisible = false;
                    this.setupBody();
                    this._displayMesh.rotationQuaternion = Quaternion.RotationAxis(new Vector3(0, 1, 0), Math.PI);
                    this._mesh.addChild(this._displayMesh);
                    this._displayMesh.position = new Vector3(0, -0.70, 0);
                    this._turretFake.position = new Vector3(0, 2.5, 0);
                } else {
                    mesh.receiveShadows = true;
                    Bus.send(EVT_ADDSHADOW, mesh);

                }
            });
            if (oldmesh !== undefined) {
                oldmesh.dispose();
            }

            this._loaded = true;

            this.setupTank();
            this._mesh.physicsBody.disablePreStep = false;
            this._mesh.physicsBody.transformNode.rotationQuaternion = Quaternion.FromEulerAngles(this._go.rotation[0], this._go.rotation[1], this._go.rotation[2]);
            this._mesh.physicsBody.transformNode.position.set(this._go.position[0], this._go.position[1], this._go.position[2]);
            gscene.onAfterRenderObservable.addOnce(() => {
                // Turn disablePreStep on again for maximum performance
                this._mesh.physicsBody.disablePreStep = true;
            })
            this._isSetup = true;
            this.onLoaded();
        };
        task.onError = function (task) {
            console.error("Error loading aircraft", task.errorObject.exception.message);
        };
    }

    getPosition() {
        return this._mesh?.physicsBody?.transformNode?.position || new Vector3(0, 0, 0);
    }

    setupTank() {
        const offset = new Vector3(this._go.position[0], this._go.position[1], this._go.position[2]);
        const flWheel = this.CreateWheelMesh(new Vector3(1.5, 0, 3), offset);
        const flAxle = this.CreateAxleMesh(new Vector3(1.5, 0, 3), offset);
        const frWheel = this.CreateWheelMesh(new Vector3(-1.5, 0, 3), offset);
        const frAxle = this.CreateAxleMesh(new Vector3(-1.5, 0, 3), offset);
        const rlWheel = this.CreateWheelMesh(new Vector3(1.5, 0, -3), offset);
        const rlAxle = this.CreateAxleMesh(new Vector3(1.5, 0, -3), offset);
        const rrWheel = this.CreateWheelMesh(new Vector3(-1.5, 0, -3), offset);
        const rrAxle = this.CreateAxleMesh(new Vector3(-1.5, 0, -3), offset);

        const mrWheel = this.CreateWheelMesh(new Vector3(-1.5, 0, 0), offset);
        const mrAxle = this.CreateAxleMesh(new Vector3(-1.5, 0, 0), offset);
        const mlWheel = this.CreateWheelMesh(new Vector3(1.5, 0, 0), offset);
        const mlAxle = this.CreateAxleMesh(new Vector3(1.5, 0, 0), offset);

        for (const mesh of [flAxle, frAxle, rlAxle, rrAxle, mrAxle, mlAxle]) {
            this._mesh.addChild(mesh);
            this.AddAxlePhysics(mesh, 100, 0, 0);
            this.FilterMeshCollisions(mesh);
        }

        for (const mesh of [flWheel, frWheel, rlWheel, rrWheel, mrWheel, mlWheel]) {
            this.AddWheelPhysics(mesh, 100, 0.1, 250);
            this.FilterMeshCollisions(mesh);
        }

        this.poweredWheelMotorA = this.CreatePoweredWheelJoint(flAxle, flWheel);
        this.poweredWheelMotorB = this.CreatePoweredWheelJoint(frAxle, frWheel);
        this.poweredWheelMotorC = this.CreatePoweredWheelJoint(rrAxle, rrWheel);
        this.poweredWheelMotorD = this.CreatePoweredWheelJoint(rlAxle, rlWheel);

        this.poweredWheelMotorE = this.CreatePoweredWheelJoint(mrAxle, mrWheel);
        this.poweredWheelMotorF = this.CreatePoweredWheelJoint(mlAxle, mlWheel);


        this.steerWheelA = this.AttachAxleToFrame(flAxle.physicsBody, this.carFrameBody, true);
        this.steerWheelB = this.AttachAxleToFrame(frAxle.physicsBody, this.carFrameBody, true);
        this.AttachAxleToFrame(rlAxle.physicsBody, this.carFrameBody, false);
        this.AttachAxleToFrame(rrAxle.physicsBody, this.carFrameBody, false);

        this.AttachAxleToFrame(mrAxle.physicsBody, this.carFrameBody, false);
        this.AttachAxleToFrame(mlAxle.physicsBody, this.carFrameBody, false);
    }



    pulse(delta) {
        //super.pulse();
        if (!this._isSetup) {
            return;
        }

        this.calculateSpeed();


        //this._turret.position = this._mesh.getAbsolutePosition().add(new Vector3(0, 1.5, 0));
        this._turretFake.position = this._turret.getAbsolutePosition().add(new Vector3(0, 0.1, 0));

        this.currentSteeringAngle -= this._roll * 0.01;
        this.currentSteeringAngle *= 0.98;
        // limit to 2.0
        this.currentSteeringAngle = Math.min(Math.max(this.currentSteeringAngle, -this.maxSteeringAngle), this.maxSteeringAngle);

        //const [innerAngle, outerAngle] = this.CalculateWheelAngles(this.currentSteeringAngle);
        //this.steerWheelA.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_Y, outerAngle);
        //this.steerWheelB.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_Y, innerAngle);

        if (this._speed < this._topSpeed) {
            this._throttle += this._pitch * 0.003 * delta;
            if (this._pitch == 0) {
                this._throttle *= 0.99;
            }
        }
        
        this._throttle = Math.min(Math.max(this._throttle, -this.maxSpeed), this.maxSpeed);  

        const [motorA, motorB, motorC, motorD] = this.CalculateWheelSpeeds(this._throttle, this.currentSteeringAngle);

        
        this.poweredWheelMotorA.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_X, motorA);
        this.poweredWheelMotorB.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_X, motorB);
        this.poweredWheelMotorC.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_X, motorC);
        this.poweredWheelMotorD.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_X, motorD);

        this.poweredWheelMotorE.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_X, motorB);
        this.poweredWheelMotorF.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_X, motorA);

        // calculat eh wheel motor targets for a tank, turning or going straight                
    }

    /**
     * Wheel speeds for a tank, turning on the spot, or while moving.
     * @param {*} speed 
     * @param {*} steeringAngle 
     * @returns 
     */
    CalculateWheelSpeeds(speed, steeringAngle) {
        if (Math.round(speed) == 0) {
            return [steeringAngle * 10, -steeringAngle * 10, -steeringAngle * 10, steeringAngle * 10];
        }

        const innerSpeed = 5 * speed + steeringAngle * 5 * speed;
        const outerSpeed = 5 * speed + -steeringAngle * 5 * speed;

        return [innerSpeed, outerSpeed, outerSpeed, innerSpeed];
    }



    setInputs(delta, pitch, roll, yaw, throttle, mouseTarget, fire1) {

        this._pitch = pitch;
        this._roll = roll;
        this._yaw += yaw * this._yawrate * delta;
        //this._throttle = throttle + pitch;

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
        CBulletManager.fireBullet(this._gun1, this.getAttribute("barrellength"));
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

        this._turretFake.lookAt(target, 0, 0, 0);

        this._mesh.computeWorldMatrix(true);
        const pos = this._mesh.getAbsolutePosition();

        const eu = this._turretFake.rotationQuaternion.toEulerAngles();
        const mu = this._mesh.rotationQuaternion.toEulerAngles();
        this._targetTurretRotation = Quaternion.FromEulerAngles(0, eu.y - mu.y, 0);
        this._turret.rotationQuaternion = Quaternion.Slerp(this._turret.rotationQuaternion, this._targetTurretRotation, this._turretTurnRate * delta);

        this._gun1.computeWorldMatrix(true);
        const limitedeux = Math.min(Math.max(-eu.x, -0.1), 0.2);
        let targetGunRotation = Quaternion.FromEulerAngles(limitedeux, 0, 0);
        this._gun1.rotationQuaternion = Quaternion.Slerp(this._gun1.rotationQuaternion, targetGunRotation, this._turretTurnRate * delta);

        // draw debug line along turrent
        Bus.send(EVT_DEBUGLINE, { from: pos, to: target });
        Bus.send(EVT_DEBUG, -eu.x.toFixed(2) + "," + eu.y.toFixed(2) + "," + eu.z.toFixed(2));

    }

    // override
    onLoaded() {
        console.log("Tank  onLoaded");
    }

    getCameraAttachmentObject() {
        return this._turretFake;
    }
}

export default Tank;