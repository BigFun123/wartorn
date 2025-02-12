import { MeshBuilder, PhysicsAggregate, PhysicsShapeType, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import GameObject from "./GameObject";
import { gscene, PrimaryLayer } from "./Global";

class Water extends GameObject {

    setup() {
        const oldMesh = this._mesh;

        this._mesh = MeshBuilder.CreateGround("ground", { width: this._go.scale[0], height: this._go.scale[2] }, gscene);
        // add texture
        this._mesh.position = new Vector3(this._go.position[0], this._go.position[1], this._go.position[2]);
        this._mesh.visibility = 0.5;
        this._mesh.layerMask = PrimaryLayer;
        const groundMaterial = new StandardMaterial("ground", gscene);
        groundMaterial.diffuseTexture = new Texture("assets/textures/water.png", gscene);
        // tile 10 times
        groundMaterial.diffuseTexture.uScale = 100;
        groundMaterial.diffuseTexture.vScale = 100;
        this._mesh.material = groundMaterial;
        this._mesh.receiveShadows = true;
        this._aggregate = new PhysicsAggregate(this._mesh, PhysicsShapeType.BOX, { mass: 0 }, gscene);

        if (oldMesh !== undefined) {
            oldMesh.dispose();
        }
    }

    pulse(delta) {
        this._mesh.rotate(Vector3.Up(), 0.000001 * delta);
    }
}

export default Water;