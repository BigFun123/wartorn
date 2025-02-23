import { HavokPlugin, Vector3 } from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import { gscene } from "./Global";
import { Bus, EVT_WORLDLOADED } from "./Bus";

class CPhysics {
    _havok;
    _hk;

    constructor() {
        this.setup();
    }

    async setup() {
        this._havok = await HavokPhysics();
        this._hk = new HavokPlugin(true, this._havok);
        gscene.enablePhysics(new Vector3(0,-90.8, 0), this._hk);
        gscene.getPhysicsEngine().setTimeStep(1 / 500);
        gscene.getPhysicsEngine().setSubTimeStep(4.5);
        console.log("Physics Timestep: ", this._hk.getTimeStep());


        Bus.subscribe(EVT_WORLDLOADED, () => {
           //gscene.getPhysicsEngine().setGravity(new Vector3(0, -4.81, 0));
        });

        //gscene.enablePhysics(new Vector3(0, 0, 0), this._hk);
    }
}

export default CPhysics;