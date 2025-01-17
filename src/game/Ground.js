import { MeshBuilder, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core";
import GameObject from "./GameObject";
import { gscene } from "./Global";

class Ground extends GameObject {

    setup() {
        const oldMesh = this._mesh;

        this._mesh = MeshBuilder.CreateGround("ground", { width: this._go.scale[0], height: this._go.scale[2] }, gscene);
        this._mesh.receiveShadows = true;
        this._aggregate = new PhysicsAggregate(this._mesh, PhysicsShapeType.BOX, { mass: 0 }, gscene);

        if (oldMesh !== undefined) {
            oldMesh.dispose();
        }
    }
}

export default Ground;