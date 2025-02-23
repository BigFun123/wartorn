import { PhysicsAggregate, PhysicsShapeType, Vector3 } from "@babylonjs/core";
import AssetMan from "./AssetMan";
import { Bus, EVT_ADDSHADOW } from "./Bus";
import GameObject from "./GameObject";

class StaticMesh extends GameObject {
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
                    this._mesh.position = new Vector3(this._go.position[0], this._go.position[1], this._go.position[2]);
                    this._mesh.scaling = new Vector3(0.1, 0.1, 0.1);
                    mesh.isVisible = false;
                    mesh.aggregate = new PhysicsAggregate(mesh, PhysicsShapeType.MESH, { mass: 0, restitution: 0.4, friction: 0.1, linearDamping: 0.5 }, this.scene);
                    //setMotionType(motionType: PhysicsMotionType STATIC ANIMATED, instanceIndex?: number): void;
                    mesh.aggregate.body.disablePreStep = false;                    
                    //mesh.aggregate.transformNode.position.set(this._go.position[0], this._go.position[1], this._go.position[2]);
                    mesh.aggregate.body.setCollisionCallbackEnabled(true);
                    mesh.aggregate.body.getCollisionObservable().add((collider) => {
                        this.onCollision(collider);
                    });
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

        };
        task.onError = function (task) {
            console.error("Error loading mesh", task?._errorObject?.exception);
        };
    }
  
}            


export default StaticMesh;