import { Vector3 } from "@babylonjs/core";
import GameObject from "./GameObject";

export default class IVehicle extends GameObject {
    _maxThrottle = 1;
    _minThrottle = 0;
    _velocity = new Vector3(0, 0, 0);
    _speed = 0;
}