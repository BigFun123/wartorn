import { Axis, Matrix, Quaternion, Ray, Vector3 } from "@babylonjs/core";
import { gplayer, gscene } from "./Global";
import { Bus, EVT_DEBUG } from "./Bus";

class NPC {
    _golem;
    _currentTarget = null;
    _counter = 0;
    _counterSense = 100;
    _counterMax = 200;
    name = "NPC";
    health = 100;
    damage = 0;
    armor = 0;
    awarenessObjecs = [];
    aoi = Vector3.Zero();
    progress = 0;


    constructor(golem, go) {
        this._golem = golem;
        this._golem._isNPC = true;
        this.name = go.name;
        this.health = go.health;
        this.damage = go.damage;
        this.armor = go.armor;
        this.type = go.type;
        if (go.aoi) {
            this.aoi = new Vector3(go.aoi[0], go.aoi[1], go.aoi[2]);
        }
        
    }

    /**
     * Get all the enemies in the field of view
     */
    doSensing(){ 
        const mesh = this._golem._mesh;
        const fwd = mesh.forward;
        const pos = mesh.getAbsolutePosition();
        const ray = new Ray(pos, fwd, 100);
        const hit = gscene.pickWithRay(ray);
        if (hit.hit) {
            //this._currentTarget = hit.pickedMesh;
           // Bus.send(EVT_DEBUG, "Changed target to " + this._currentTarget.name);
        }
    }

    doAttack(target) {
        if (this._currentTarget?._loaded) {
            this._golem.fire();
        }
    }

    doTank(delta) {
        if (this._currentTarget?._loaded) {
            this._golem.pointTurretAtTarget(this._currentTarget._mesh.getAbsolutePosition(), delta);
            this._golem.pointBodyAtTarget(this._currentTarget._mesh.getAbsolutePosition(), delta);
            //this.attack(this._currentTarget);
        } else {
            this._currentTarget = gplayer._craft;
        }
    }

    doDrone(delta) {
        // orbit the drone around the aoi point by this.progress
        this.progress += 0.01;
        const radius = 5;

        const x = Math.sin(this.progress) * radius + this.aoi.x;
        const z = Math.cos(this.progress) * radius + this.aoi.z;
        const y = this.aoi.y;
        const pos = new Vector3(x, y, z);
        this._golem._mesh.position = pos;

        // rotate the drone to face the path
        const fwd = pos.subtract(this._golem._mesh.position);
        this._golem._mesh.lookAt(pos, Math.PI);




    }

    pulse(delta) {
        if (this.type === "tank") {
            this.doTank(delta);
        }
        if (this.type === "drone") {
            this.doDrone(delta);
        }
        
        this._counter++;
        if (this._counter % this._counterSense) {
            this.doSensing();
        }

        if (this._counter > this._counterMax) {
            this._counter = 0;
            this.doAttack();
        }
    }

    getMesh() {
        return this._golem._mesh;
    }
}

export default NPC;