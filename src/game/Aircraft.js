import { PhysicsAggregate, PhysicsBody, PhysicsShapeType, Quaternion, SceneLoader, Texture, Vector3 } from "@babylonjs/core";
import GameObject from "./GameObject";
import AssetMan from "./AssetMan";
import { gscene } from "./Global";
import { Bus, EVT_ADDSHADOW, EVT_DEBUG } from "./Bus";
import CControlSurfaces from "./CControlSurfaces";
import IVehicle from "./IVehicle";

class Aircraft extends IVehicle {

    _throttle = 0;
    _power = 1;
    _pitch = 0;
    _pitchrate = 1;
    _roll = 0;
    _rollrate = 2;
    _yaw = 0;
    _yawrate = 0.5;
    _playercontrolled = false;
    _canPitch = 0;
    _controlSurfaces = null;

    setup() {
        const oldmesh = this._mesh;

        const task = AssetMan.getInstance()._assetman.addMeshTask(this._go.name, "", "assets/", this._go.file);
        task.onSuccess = (task) => {
            this.afterLoadedTasks(task.loadedMeshes);
            this._controlSurfaces = new CControlSurfaces(gscene);
            this._controlSurfaces.setup(task.loadedMeshes);
            task.loadedMeshes.forEach((mesh) => {
                if (mesh.name === "Collision") {
                    this._mesh = mesh;
                    this._mesh.scaling = new Vector3(0.1, 0.1, 0.1);
                    mesh.isVisible = false;
                    this._mesh.position = new Vector3(this._go.position[0], this._go.position[1], this._go.position[2]);
                    mesh.aggregate = new PhysicsAggregate(mesh, PhysicsShapeType.MESH, { mass: 0.5, restitution: 0.4, friction: 0.701, linearDamping: 0.15 }, this.scene);
                    mesh.aggregate.body.disablePreStep = false;
                    mesh.aggregate.body.setLinearDamping(0.15);
                    mesh.aggregate.body.setGravityFactor(0.05);
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

            this._loaded = true;
            //this._mesh.rotation.x = Math.PI / 4.1;
            //this._mesh.rotation.z = Math.PI / 4.1;
            //this._aggregate = new PhysicsAggregate(this._mesh, PhysicsShapeType.BOX, { mass: 1 }, gscene);
        };
        task.onError = function (task) {
            console.error("Error loading aircraft", task);
        };
        
    }

    pulse() {
        // calculate speed
        super.pulse();        
        this._canPitch = Math.min(1, this._speed / 8);
        this._canRoll = Math.min(1, this._speed / 8);
        let forwardness = Math.abs(Vector3.Dot(this._mesh.forward, this._velocity.normalize()));
        Bus.send(EVT_DEBUG, "forwardness: " + forwardness);

        if (this._aggregate !== undefined) {
            this._aggregate.body.applyForce(this._mesh.forward.scale(-this._throttle * this._power), this._mesh.getAbsolutePosition().add(this._mesh.forward.scale(-2)));
            this._aggregate.body.applyForce(this._mesh.up.scale(0.014 * forwardness * this._speed), this._mesh.getAbsolutePosition());
            //this._aggregate.body.applyForce(this._mesh.up.scale(this._pitch * 10), this._mesh.getAbsolutePosition());
            this._aggregate.body.setAngularVelocity(this._mesh.right.scale(this._pitch * 2 * this._canPitch)
            .add(this._mesh.up.scale(-this._yaw * this._yawrate))
            .add(this._mesh.forward.scale(this._roll * this._rollrate * this._canRoll)));

        }

        this._controlSurfaces.setControlSurfaces(-this._yaw, -this._pitch, -this._roll);
    }

    setInputs(delta, pitch, roll, yaw, throttle) {
        this._pitch = pitch;
        this._roll = roll;
        this._yaw = yaw;
        this._throttle = throttle;
    }
}

export default Aircraft;