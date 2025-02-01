import { Ray } from "@babylonjs/core";
import { gplayer, gscene } from "./Global";
import { Bus, EVT_DEBUG } from "./Bus";

class NPC {
    _controller;
    _currentTarget = null;
    _counter = 0;
    _counterSense = 100;
    _counterMax = 200;
    name = "NPC";
    health = 100;
    damage = 0;
    armor = 0;
    awarenessObjecs = [];


    constructor(controller, name, health, damage, armor) {
        this._controller = controller;
        this._controller._isNPC = true;
        this.name = name;
        this.health = health;
        this.damage = damage;
        this.armor = armor;
    }

    /**
     * Get all the enemies in the field of view
     */
    doSensing(){ 
        const mesh = this._controller._mesh;
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
            this._controller.fire();
        }
    }

    doTank(delta) {
        if (this._currentTarget?._loaded) {
            this._controller.pointTurretAtTarget(this._currentTarget._mesh.getAbsolutePosition(), delta);
            this._controller.pointBodyAtTarget(this._currentTarget._mesh.getAbsolutePosition(), delta);
            //this.attack(this._currentTarget);
        } else {
            this._currentTarget = gplayer._craft;
        }
    }

    pulse(delta) {
        this.doTank(delta * 0.001);
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
        return this._controller._mesh;
    }
}

export default NPC;