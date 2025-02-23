import { Color3, MeshBuilder, Physics6DoFConstraint, PhysicsBody, PhysicsConstraintAxis, PhysicsConstraintMotorType, PhysicsMotionType, PhysicsShapeBox, PhysicsShapeCylinder, Quaternion, StandardMaterial, Texture, Vector3, Vector4 } from "@babylonjs/core";
import IVehicle from "./IVehicle";
import { gscene } from "../Global";

export const FILTERS = { CarParts: 1, Environment: 2 }

export const debugColours = [];
debugColours[1] = new Color3(1, 0, 0);
debugColours[0] = new Color3(1, 0, 1);
debugColours[2] = new Color3(0, 1, 0);
debugColours[3] = new Color3(1, 1, 0);
debugColours[4] = new Color3(0, 1, 1);
debugColours[5] = new Color3(0, 0, 1);

export class CCar extends IVehicle {
    _showDebugObjects = false;
    tyreMaterial;
    currentSpeed = 0;
    currentSteeringAngle = 0;
    maxSteeringAngle = Math.PI / 6;
    maxSpeed = 150;

    setupBody() {
        this._mesh = MeshBuilder.CreateBox("Tank", { height: 1.0, width: 2.5, depth: 5, faceColors: this.debugColours });
        this._mesh.position = new Vector3(this._go.position[0], this._go.position[1], this._go.position[2]);        
        this.carFrameBody = this.AddDynamicPhysics(this._mesh, 1000, 0, 0);
        this._mesh.material = this.tyreMaterial;
        this._mesh.isVisible = this._showDebugObjects;
        //this.FilterMeshCollisions(this._mesh);
    }

     setupWheelsCarFWD() {
            const offset = new Vector3(this._go.position[0], this._go.position[1], this._go.position[2]);
            const flWheel = this.CreateWheelMesh(new Vector3(1.5, 0, 3), offset);
            const flAxle =   this.CreateAxleMesh(new Vector3(1.5, 0, 3), offset);
            const frWheel = this.CreateWheelMesh(new Vector3(-1.5, 0, 3), offset);
            const frAxle =   this.CreateAxleMesh(new Vector3(-1.5, 0, 3),offset);
            const rlWheel = this.CreateWheelMesh(new Vector3(1.5, 0, -3), offset);
            const rlAxle =   this.CreateAxleMesh(new Vector3(1.5, 0, -3), offset);
            const rrWheel = this.CreateWheelMesh(new Vector3(-1.5, 0, -3), offset);
            const rrAxle =   this.CreateAxleMesh(new Vector3(-1.5, 0, -3), offset);
    
            for (const mesh of [flAxle, frAxle, rlAxle, rrAxle]) {
                this._mesh.addChild(mesh);
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

    pulse() {
        if (!this._isSetup) {
            return;
        }

        this.currentSteeringAngle -= this._roll * 0.01;
        this.currentSteeringAngle *= 0.98;
        // limit to 2.0
        this.currentSteeringAngle = Math.min(Math.max(this.currentSteeringAngle, -this.maxSteeringAngle), this.maxSteeringAngle);

        const [innerAngle, outerAngle] = this.CalculateWheelAngles(this.currentSteeringAngle);
        this.steerWheelA.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_Y, outerAngle);
        this.steerWheelB.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_Y, innerAngle);

        this.currentSpeed += this._pitch * 0.05;
        if (this._pitch == 0) {
            this.currentSpeed *= 0.99;
        }

        this.poweredWheelMotorA.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_X, this.currentSpeed);
        this.poweredWheelMotorB.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_X, this.currentSpeed);
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

    InitTyreMaterial() {
        this.tyreMaterial = new StandardMaterial("Tyre", gscene);
        const upTexture = new Texture("textures/up.png", gscene);
        upTexture.wAng = -Math.PI / 2;
        upTexture.vScale = 0.4;
        this.tyreMaterial.diffuseTexture = upTexture;
        this.tyreMaterial.visibility = 0.0;
        //this.tyreMaterial.disableColorWrite = true;
    }

    AddWheelPhysics(mesh, mass, bounce, friction) {
        const physicsShape = new PhysicsShapeCylinder(new Vector3(-0.8, 0, 0), new Vector3(0.8, 0, 0), 1, gscene);
        const physicsBody = new PhysicsBody(mesh, PhysicsMotionType.DYNAMIC, false, gscene);
        physicsBody.setMassProperties({ mass: mass });        
        physicsShape.material = { restitution: bounce, friction: friction };
        physicsBody.shape = physicsShape;
        //mesh.physicsBody = physicsBody;

        return physicsBody;
    }

    AddAxlePhysics(mesh, mass, bounce, friction) {
        //
        // NOTE: Making the axle shape similar dimensions to the wheel shape increases stability of the joint when it is added
        //
        const physicsShape = new PhysicsShapeCylinder(new Vector3(-0.8, 0, 0), new Vector3(0.8, 0, 0), 0.23, gscene);
        const physicsBody = new PhysicsBody(mesh, PhysicsMotionType.DYNAMIC, false, gscene);
        physicsBody.setMassProperties({ mass: mass });
        physicsShape.material = { restitution: bounce, friction: friction };
        physicsBody.shape = physicsShape;
        mesh.physicsBody = physicsBody;

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


    FilterMeshCollisions(mesh) {
        mesh.physicsBody.shape.filterMembershipMask = FILTERS.CarParts;
        mesh.physicsBody.shape.filterCollideMask = FILTERS.Environment;
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
                     minLimit: -0.05,
                     maxLimit: 0.05,
                    // stiffness: 100000,
                    // damping: 5000
                    //minLimit: -0.,
                    //maxLimit: 0.,
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
                    minLimit: 0,
                    maxLimit: 0,
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

    CreateAxleMesh(position, offset) {
        const axleMesh = MeshBuilder.CreateBox("Axle", { height: 0.24, width: 1.75, depth: 0.1, faceColors: this.debugColours });
        axleMesh.position = position.add(offset);
        axleMesh.material = this.tyreMaterial;
        axleMesh.isVisible = this._showDebugObjects;

        return axleMesh;
    }

    CreateWheelMesh(position, offset) {
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
        wheelMesh.position = position.add(offset);

        wheelMesh.material = this.tyreMaterial;
        wheelMesh.isVisible = this._showDebugObjects;

        return wheelMesh;
    }

}