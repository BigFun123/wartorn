import { MeshBuilder, PhysicsAggregate, PhysicsShapeType, Quaternion, StandardMaterial, Texture, Vector4 } from "@babylonjs/core";
import GameObject from "./GameObject";
import { gscene } from "./Global";
import { EulerDegreesToQuaternion } from "./Utils";

class Cube extends GameObject {

    setup() {
        const oldMesh = this._mesh;

        this._mesh = MeshBuilder.CreateBox("box", { width: this._go.scale[0], height: this._go.scale[2] }, gscene);
        this._mesh.receiveShadows = true;
        this._mesh.rotationQuaternion = EulerDegreesToQuaternion(this._go.rotation);
        this._mesh.position.set(this._go.position[0], this._go.position[1], this._go.position[2]);
        
        this._aggregate = new PhysicsAggregate(this._mesh, PhysicsShapeType.BOX, { mass: 0, friction: 1 }, gscene);

        const groundMat = new StandardMaterial("groundTexture", gscene);
        groundMat.diffuseTexture = new Texture("assets/textures/dirt.jpg", gscene);
        groundMat.diffuseTexture.uScale = 1000;
        groundMat.diffuseTexture.vScale = 1000;
        this._mesh.material = groundMat;

        if (oldMesh !== undefined) {
            oldMesh.dispose();
        }
    }

    reset() {};
}

export default Cube;