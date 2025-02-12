import { Color3, MeshBuilder, Physics6DoFConstraint, PhysicsAggregate, PhysicsBody, PhysicsConstraintAxis, PhysicsConstraintMotorType, PhysicsMotionType, PhysicsShapeBox, PhysicsShapeCylinder, PhysicsShapeMesh, PhysicsShapeType, Quaternion, SceneLoader, Space, StandardMaterial, Texture, Tools, Vector2, Vector3, Vector4 } from "@babylonjs/core";
import GameObject from "./GameObject";
import AssetMan from "./AssetMan";
import { gscene } from "./Global";
import { Bus, EVT_ADDSHADOW, EVT_DEBUG, EVT_DEBUGLINE, EVT_DEBUGVEC, EVT_PLAY3DAUDIO } from "./Bus";
import CControlSurfaces from "./CControlSurfaces";
import IVehicle from "./IVehicle";
import CBulletManager from "./BulletMan";

const FILTERS = { CarParts: 1, Environment: 2 }
const debugColours = [];
debugColours[1] = new Color3(1, 0, 0);
debugColours[0] = new Color3(1, 0, 1);
debugColours[2] = new Color3(0, 1, 0);
debugColours[3] = new Color3(1, 1, 0);
debugColours[4] = new Color3(0, 1, 1);
debugColours[5] = new Color3(0, 0, 1);
let tyreMaterial;
let currentSpeed = 0;
let currentSteeringAngle = 0;
let maxSpeed = 150;
const maxSteeringAngle = Math.PI / 6;

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
                    mesh.isVisible = false;
                    this.setupBody();                    
                    this._mesh.rotationQuaternion = Quaternion.RotationAxis(new Vector3(0, 1, 0), Math.PI);                    
                    this.carFrame.addChild(mesh);
                    this._mesh.position = new Vector3(0, -1.7, 0);
                } else {
                    mesh.receiveShadows = true;
                    Bus.send(EVT_ADDSHADOW, mesh);

                }
            });
            if (oldmesh !== undefined) {
                oldmesh.dispose();
            }
            
            this._loaded = true;
            this.InitTyreMaterial();
            this.setupWheels2();
            this.carFrame.physicsBody.disablePreStep = false;
            this.carFrame.physicsBody.transformNode.position.set(this._go.position[0], this._go.position[1], this._go.position[2]);
            this.carFrame.physicsBody.transformNode.rotationQuaternion.set(this._go.rotation[0], this._go.rotation[1], this._go.rotation[2], this._go.rotation[3]);
            gscene.onAfterRenderObservable.addOnce(() => {
            // Turn disablePreStep on again for maximum performance
              this.carFrame.physicsBody.disablePreStep = true;
            })
            this._isSetup = true;
        };
        task.onError = function (task) {
            console.error("Error loading aircraft", task.errorObject.exception.message);
        };
    }

    getPosition() {
        return this.carFrame?.physicsBody?.transformNode?.position || new Vector3(0, 0, 0);
    }

    InitTyreMaterial() {
        tyreMaterial = new StandardMaterial("Tyre", gscene);
        const upTexture = new Texture("textures/up.png", gscene);
        upTexture.wAng = -Math.PI / 2;
        upTexture.vScale = 0.4;
        tyreMaterial.diffuseTexture = upTexture;
    }




    setupWheels2() {
        const flWheel = this.CreateWheel(new Vector3(2.3, 0, 3));
        const flAxle =   this.CreateAxle(new Vector3(2.3, 0, 3));
        const frWheel = this.CreateWheel(new Vector3(-2.3, 0, 3));
        const frAxle =   this.CreateAxle(new Vector3(-2.3, 0, 3));
        const rlWheel = this.CreateWheel(new Vector3(2.3, 0, -3));
        const rlAxle =   this.CreateAxle(new Vector3(2.3, 0, -3));
        const rrWheel = this.CreateWheel(new Vector3(-2.3, 0, -3));
        const rrAxle =   this.CreateAxle(new Vector3(-2.3, 0, -3));

        for (const mesh of [flAxle, frAxle, rlAxle, rrAxle]) {
            this.carFrame.addChild(mesh);
            this.AddAxlePhysics(mesh, 100, 0, 0);
            this.FilterMeshCollisions(mesh);
        }

        for (const mesh of [flWheel, frWheel, rlWheel, rrWheel]) {
            this.AddWheelPhysics(mesh, 100, 0.1, 50);
            this.FilterMeshCollisions(mesh);
        }

        this.poweredWheelMotorA = this.CreatePoweredWheelJoint(flAxle, flWheel);
        this.poweredWheelMotorB = this.CreatePoweredWheelJoint(frAxle, frWheel);
        this.CreateWheelJoint(rlAxle, rlWheel);
        this.CreateWheelJoint(rrAxle, rrWheel);

        this.steerWheelA = this.AttachAxleToFrame(flAxle.physicsBody, this.carFrameBody, true);
        this.steerWheelB = this.AttachAxleToFrame(frAxle.physicsBody, this.carFrameBody, true);
        this.AttachAxleToFrame(rlAxle.physicsBody, this.carFrameBody, false);
        this.AttachAxleToFrame(rrAxle.physicsBody, this.carFrameBody, false);
    }

    setupBody() {
        this.carFrame = MeshBuilder.CreateBox("Tank", { height: 1.5, width: 2.5, depth: 5, faceColors: debugColours });
        //this.carFrame.position = new Vector3(0, 0.5, 0);
        this.carFrame.position = new Vector3(this._go.position[0], this._go.position[1]+ 0.5, this._go.position[2]);
        this.carFrame.visibility = 0.5;
        this.carFrameBody = this.AddDynamicPhysics(this.carFrame, 1000, 0, 0);
        this.FilterMeshCollisions(this.carFrame);
    }

    CreateWheel(position) {
        const faceUVforArrowTexture = [
            new Vector4(0, 0, 0, 0),
            new Vector4(0, 1, 1, 0),
            new Vector4(0, 0, 0, 0),
        ]

        const wheelMesh = MeshBuilder.CreateCylinder("Wheel", { height: 0.8, diameter: 2, faceUV: faceUVforArrowTexture });
        wheelMesh.rotation = new Vector3(0, 0, Math.PI / 2);
        // 
        // NOTE: The rotation of the wheel is baked here so that future rotations 
        // get a clean slate (makes setting up constraints much easier)
        //
        wheelMesh.bakeCurrentTransformIntoVertices();
        wheelMesh.position = position.add(new Vector3(this._go.position[0], this._go.position[1], this._go.position[2]));

        wheelMesh.material = tyreMaterial;

        return wheelMesh;
    }

    CreateAxle(position) {
        const axleMesh = MeshBuilder.CreateBox("Axle", { height: 0.24, width: 1.75, depth: 0.1, faceColors: debugColours });
        axleMesh.position = position.add(new Vector3(this._go.position[0], this._go.position[1], this._go.position[2]));

        return axleMesh;
    }

    AttachAxleToFrame(axle, frame, hasSteering) {
        const aPos = axle.transformNode.position;

        const joint = new Physics6DoFConstraint(
            {
                pivotA: new Vector3(0, 0, 0),
                pivotB: new Vector3(aPos.x, aPos.y, aPos.z),
            },
            //
            // NOTE: The following limit settings provide suspension (axis LINEAR_Y), some angular leeway (ANGULAR_X, ANGULAR_Z), 
            // and freedom to steer if required (ANGULAR_Y)
            //
            [
                {
                    axis: PhysicsConstraintAxis.LINEAR_X,
                    minLimit: 0,
                    maxLimit: 0,
                },
                {
                    axis: PhysicsConstraintAxis.LINEAR_Y,
                    // minLimit: -0.15,
                    // maxLimit: 0.15,
                    // stiffness: 100000,
                    // damping: 5000
                    minLimit: -0.,
                    maxLimit: 0.,
                    stiffness: 100000,
                    damping: 5000
                },
                {
                    axis: PhysicsConstraintAxis.LINEAR_Z,
                    minLimit: 0,
                    maxLimit: 0,
                },
                {
                    axis: PhysicsConstraintAxis.ANGULAR_X,
                    minLimit: -0.25,
                    maxLimit: 0.25,
                },
                {
                    axis: PhysicsConstraintAxis.ANGULAR_Y,
                    minLimit: hasSteering ? null : 0,
                    maxLimit: hasSteering ? null : 0,
                },
                {
                    axis: PhysicsConstraintAxis.ANGULAR_Z,
                    // minLimit: -0.05,
                    // maxLimit: 0.05,
                    minLimit: -0.0,
                    maxLimit: 0.0,
                },
            ],
            gscene
        );

        axle.addConstraint(frame, joint);

        if (hasSteering)
            this.AttachSteering(joint);

        return joint;
    }

    CreateWheelJoint(axle, wheel) {
        const motorJoint = new Physics6DoFConstraint(
            {},
            [
                {
                    axis: PhysicsConstraintAxis.LINEAR_DISTANCE,
                    minLimit: 0,
                    maxLimit: 0,
                },
                {
                    axis: PhysicsConstraintAxis.ANGULAR_Y,
                    minLimit: 0,
                    maxLimit: 0,
                },
                {
                    axis: PhysicsConstraintAxis.ANGULAR_Z,
                    minLimit: 0,
                    maxLimit: 0,
                },
            ],
            gscene
        );

        axle.addChild(wheel);
        axle.physicsBody.addConstraint(wheel.physicsBody, motorJoint);

        return motorJoint;
    }

    CreatePoweredWheelJoint(axle, wheel) {
        const motorJoint = this.CreateWheelJoint(axle, wheel);

        motorJoint.setAxisMotorType(PhysicsConstraintAxis.ANGULAR_X, PhysicsConstraintMotorType.VELOCITY);
        //
        // NOTE: setAxisMotorMaxForce acts as torque here (strength of wheel getting to target speed)
        //
        motorJoint.setAxisMotorMaxForce(PhysicsConstraintAxis.ANGULAR_X, 180000);
        motorJoint.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_X, 0);

        return motorJoint;
    }

    AttachSteering(joint) {
        joint.setAxisMotorType(PhysicsConstraintAxis.ANGULAR_Y, PhysicsConstraintMotorType.POSITION);
        //
        // NOTE: setAxisMotorMaxForce acts like power steering here (strength of wheel getting to target steering angle)
        //
        joint.setAxisMotorMaxForce(PhysicsConstraintAxis.ANGULAR_Y, 30000000);
        joint.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_Y, 0);

        return joint;
    }

    AddWheelPhysics(mesh, mass, bounce, friction) {
        const physicsShape = new PhysicsShapeCylinder(new Vector3(-0.8, 0, 0), new Vector3(0.8, 0, 0), 1.2, gscene);
        const physicsBody = new PhysicsBody(mesh, PhysicsMotionType.DYNAMIC, false, gscene);
        physicsBody.setMassProperties({ mass: mass });
        physicsShape.material = { restitution: bounce, friction: friction };
        physicsBody.shape = physicsShape;
        //mesh.physicsBody = physicsBody;

        return physicsBody;
    }

    AddDynamicPhysics(mesh, mass, bounce, friction) {
        const physicsShape = new PhysicsShapeBox(mesh.position, Quaternion.Identity, new Vector3(1, 2, 3), gscene);
        const physicsBody = new PhysicsBody(mesh, PhysicsMotionType.DYNAMIC, false, gscene);
        physicsBody.setMassProperties({ mass: mass });
        physicsShape.material = { restitution: bounce, friction: friction };
        physicsBody.shape = physicsShape;

        return physicsBody;
    }

    AddAxlePhysics(mesh, mass, bounce, friction) {
        //
        // NOTE: Making the axle shape similar dimensions to the wheel shape increases stability of the joint when it is added
        //
        const physicsShape = new PhysicsShapeCylinder(new Vector3(-0.8, 0, 0), new Vector3(0.8, 0, 0), 0.83, gscene);
        const physicsBody = new PhysicsBody(mesh, PhysicsMotionType.DYNAMIC, false, gscene);
        physicsBody.setMassProperties({ mass: mass });
        physicsShape.material = { restitution: bounce, friction: friction };
        physicsBody.shape = physicsShape;
        mesh.physicsBody = physicsBody;

        return physicsBody;
    }


    CalculateWheelAngles(averageAngle) {
        //
        // NOTE: This is needed because of https://en.wikipedia.org/wiki/Ackermann_steering_geometry
        //
        const wheelbase = 16;
        const trackWidth = 11;

        const avgRadius = wheelbase / Math.tan(averageAngle);
        const innerRadius = avgRadius - trackWidth / 2;
        const outerRadius = avgRadius + trackWidth / 2;
        const innerAngle = Math.atan(wheelbase / innerRadius);
        const outerAngle = Math.atan(wheelbase / outerRadius);

        return [innerAngle, outerAngle];
    }



    FilterMeshCollisions(mesh) {
        mesh.physicsBody.shape.filterMembershipMask = FILTERS.CarParts;
        mesh.physicsBody.shape.filterCollideMask = FILTERS.Environment;
    }

    pulse() {

        if (!this._isSetup) {
            return;
        }

        currentSteeringAngle -= this._roll * 0.01;
        currentSteeringAngle *= 0.98;

        const [innerAngle, outerAngle] = this.CalculateWheelAngles(currentSteeringAngle);
        this.steerWheelA.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_Y, outerAngle);
        this.steerWheelB.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_Y, innerAngle);

        currentSpeed += this._pitch * 0.01;        
        if (this._pitch == 0) {
            currentSpeed *= 0.99;
        }

        this.poweredWheelMotorA.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_X, currentSpeed);
        this.poweredWheelMotorB.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_X, currentSpeed);

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
        this._targetTurretRotation = Quaternion.RotationAxis(new Vector3(0, 1, 0), -Math.PI / 2 + angle - correction - yrot);
        this._turret.rotationQuaternion = Quaternion.Slerp(this._turret.rotationQuaternion, this._targetTurretRotation, this._turretTurnRate * delta);

        this._gun1.computeWorldMatrix(true);
        let vdeltaAngle = Math.atan2(target.y - this._gun1.getAbsolutePosition().y, this._gun1.getAbsolutePosition().y);
        this._gun1.rotationQuaternion = Quaternion.Slerp(this._gun1.rotationQuaternion, Quaternion.RotationAxis(new Vector3(1, 0, 0), vdeltaAngle), this._turretTurnRate * delta);
        // draw debug line along turrent
        //Bus.send(EVT_DEBUGLINE, { from: this._turret.getAbsolutePosition(), to: target });

    }
}

export default Tank;