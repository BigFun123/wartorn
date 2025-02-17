import { MeshBuilder, PhysicsAggregate, PhysicsShapeType, StandardMaterial, Texture } from "@babylonjs/core";
import GameObject from "./GameObject";
import { gscene } from "./Global";

class Ground extends GameObject {

    setup() {
        const oldMesh = this._mesh;

        this._mesh = MeshBuilder.CreateGround("ground", { width: this._go.scale[0], height: this._go.scale[2] }, gscene);
        this._mesh.receiveShadows = true;
        this._mesh.position.set(this._go.position[0], this._go.position[1], this._go.position[2]);
        this._aggregate = new PhysicsAggregate(this._mesh, PhysicsShapeType.BOX, { mass: 0 }, gscene);

        const groundMat = new StandardMaterial("groundTexture", gscene);
        groundMat.diffuseTexture = new Texture("assets/textures/dirt.jpg", gscene);
        groundMat.diffuseTexture.uScale = 1000;
        groundMat.diffuseTexture.vScale = 1000;
        this._mesh.material = groundMat;

        if (oldMesh !== undefined) {
            oldMesh.dispose();
        }
    }
}

export default Ground;