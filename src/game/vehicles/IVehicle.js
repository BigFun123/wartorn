import { Vector3 } from "@babylonjs/core";
import GameObject from "../GameObject";

export default class IVehicle extends GameObject {
    _maxThrottle = 1;
    _minThrottle = 0;
    _throttle = 0;
    _velocity = new Vector3(0, 0, 0);
    _speed = 0;
    _topSpeed = 55;
    _rollAmt = 0;
    _altitude = 0;
    _heading = 0;
    _power = 1;

    constructor(go) {
        super(go);
        this._topSpeed = go.topspeed || 55;
    }

    getCameraAttachmentObject() {
        return this._mesh;
    }
}