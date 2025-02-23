import { Color3, Color4, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Quaternion, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import GameObject from "./GameObject";
import { gscene } from "./Global";
import AssetMan from "./AssetMan";
import { Bus, EVT_ADDSHADOW } from "./Bus";
import { _randomNumbers } from "./Utils";

class Ground extends GameObject {

    maxRocks = 100;
    _rock = null;
    // random brown colors
    _rockColors = [new Color4(0.5, 0.3, 0.1, 1), new Color4(0.6, 0.4, 0.2, 1), new Color4(0.7, 0.5, 0.3, 1), new Color4(0.8, 0.6, 0.4, 1), new Color4(0.9, 0.7, 0.5, 1)];

    setup() {
        const oldMesh = this._mesh;

        this._mesh = MeshBuilder.CreateGround("ground", { width: this._go.scale[0], height: this._go.scale[2] }, gscene);
        this._mesh.receiveShadows = true;
        this._mesh.position.set(this._go.position[0], this._go.position[1], this._go.position[2]);
        this._aggregate = new PhysicsAggregate(this._mesh, PhysicsShapeType.BOX, { mass: 0, friction: 1 }, gscene);

        const groundMat = new StandardMaterial("groundTexture", gscene);
        groundMat.diffuseTexture = new Texture("assets/textures/dirt.jpg", gscene);
        groundMat.diffuseTexture.uScale = +this._go.scale[0] * .15;
        groundMat.diffuseTexture.vScale = +this._go.scale[0] * .15;
        this._mesh.material = groundMat;

        if (oldMesh !== undefined) {
            oldMesh.dispose();
        }

        if (this._go.rockdensity) {
            const task = AssetMan.getInstance()._assetman.addMeshTask(this._go.name, "", "assets/scenery/", "rock1.glb");
            task.onSuccess = (task) => {
                //this.afterLoadedTasks(task.loadedMeshes);
                const rockMat = new StandardMaterial("rockTexture", gscene);
                rockMat.diffuseTexture = new Texture("assets/textures/stone.jpg", gscene);
                rockMat.specularColor = new Color3(0, 0, 0);
                rockMat.specularPower = 22;
                rockMat.diffuseTexture.uScale = 1;
                rockMat.diffuseTexture.vScale = 1;
                rockMat.needDepthPrePass = true;
                const rock = task.loadedMeshes[1];                
                rock.material = rockMat;
                rock.registerInstancedBuffer("color", 4);
                rock.position = new Vector3(0, 500, 0);
                rock.instancedBuffers.color = new Color4(Math.random(), Math.random(), Math.random(), 1);
                this.addRocks(rock);
                Bus.send(EVT_ADDSHADOW, rock);
            };
        }
    }

    getRandomNumber(n) {
        return _randomNumbers[n % _randomNumbers.length];
    }

    addRocks(mesh) {
        const rockDensity = this._go.rockdensity;
        const rockSize = 2;
        const rockHeight = 2;
        const totalRocks = rockDensity * this.maxRocks;
        for (let i = 0; i < totalRocks; i++) {
            const rock = mesh.createInstance("rock" + i);            
            const instanceRockHeight = this.getRandomNumber(i) * rockHeight;
            rock.isPickable = false;
            rock.scaling.addInPlace(new Vector3(this.getRandomNumber(i) * rockSize, instanceRockHeight, this.getRandomNumber(i) * rockSize));
            rock.position.set(
                this._go.position[0] + this.getRandomNumber(i) * this._go.scale[0] - this._go.scale[0] / 2,
                this._go.position[1] - instanceRockHeight,
                this._go.position[2] + this.getRandomNumber((100 - i)) * this._go.scale[2] - this._go.scale[2] / 2
            );
            
            rock.instancedBuffers.color = this._rockColors[Math.floor(Math.random() * this._rockColors.length)];

            //this._aggregate.addMesh(rock, PhysicsShapeType.BOX, { mass: 0, friction: 1 });
            this._aggregate = new PhysicsAggregate(rock, PhysicsShapeType.BOX, { mass: 0, friction: 1 }, gscene);

            //rock.rotationQuaternion = rock.rotationQuaternion.multiply(Quaternion.RotationAxis(new Vector3(0, 1, 0), Math.random() * Math.PI * 2));

        }
    }
}

export default Ground;