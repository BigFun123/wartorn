import IVehicle from "../IVehicle";

export default class CDrone extends IVehicle {

    constructor(go) {
        super(go);
        this.type = 'Drone';
        this._isNPC = true;
    }



}