import { Vector3 } from "@babylonjs/core";
import { setPlayer } from "./Global";
import CInput from "./Input";
import { Bus, EVT_CURSOR3D, EVT_DEBUG_NEXTTARGET, EVT_DEBUG_PREVTARGET, EVT_EXPORT, EVT_KEYUP, EVT_PLAYERCREATED, EVT_PLAYERUPDATE, EVT_RESET, EVT_SELECTNEXTTARGET, EVT_SELECTPREVTARGET } from "./Bus";

class Player {
    pitch = 0;
    roll = 0;
    yaw = 0;
    throttle = 0;
    jump = 0;
    crouch = 0;
    fire1 = 0;
    fire2 = 0;
    fire3 = 0;
    ignition = 1;
    maxRoll = 2;

    _craft = null;
    _status = "0";
    _mouseTarget = null;
    _target = null;
    _inputInstance = null;


    constructor(name, craft) {
        this.name = name;
        this._craft = craft;
        craft._playercontrolled = true;
        this.score = 0;
        this._inputInstance = CInput.getInstance();
        setPlayer(this);
        Bus.send(EVT_PLAYERCREATED, {});

        Bus.subscribe(EVT_CURSOR3D, (hit) => {
            this._mouseTarget = hit;
        });

        Bus.subscribe(EVT_KEYUP, (e) => {
            if (e.code === "KeyO") {
                Bus.send(EVT_RESET, {});
            }

            if (e.code === "KeyG") {
                this._craft.doGear();
            }
            if (e.code === "BracketRight") {

                if (e.shiftKey) {
                    Bus.send(EVT_DEBUG_NEXTTARGET, {});
                } else {
                    Bus.send(EVT_SELECTNEXTTARGET, {});
                }

            }
            if (e.code === "BracketLeft") {

                if (e.shiftKey) {
                    Bus.send(EVT_DEBUG_PREVTARGET, {});
                } else {
                    Bus.send(EVT_SELECTPREVTARGET, {});
                }
            }

            if (e.code === "KeyE") {
                if (e.shiftKey) {
                    Bus.send(EVT_EXPORT, {});
                }
            }

        });
    }

    reset() {
        this.score = 0;
        this.pitch = 0;
        this.roll = 0;
        this.yaw = 0;
        this.throttle = 0;
        this.jump = 0;
        this.crouch = 0;
        this.fire1 = 0;
        this.fire2 = 0;
        this.fire3 = 0;

        this._craft._pitch = 0;
        this._craft._roll = 0;
        this._craft._yaw = 0;
        this._craft._throttle = 0;

    }

    increaseScore() {
        this.score++;
    }

    handleInput(delta) {
        const zeroth = Vector3.Lerp(new Vector3(this.pitch, this.roll, this.yaw), Vector3.Zero(), 0.1);
        if (zeroth.length() < 0.01) {
            zeroth.set(0, 0, 0);
        }
        // Handle input
        if (this._inputInstance.isKeyDown("w")) {
            this.pitch += 1 * delta;
        } else if (this._inputInstance.isKeyDown("s")) {
            this.pitch -= 1 * delta;
        } else {
            this.pitch = +zeroth.x;
        }
        this.pitch = Math.min(1, Math.max(-1, this.pitch));

        if (this._inputInstance.isKeyDown("a")) {
            this.roll -= 1 * delta;
        } else if (this._inputInstance.isKeyDown("d")) {
            this.roll += 1 * delta;
        } else {
            this.roll = +zeroth.y;
        }
        this.roll = Math.min(this.maxRoll, Math.max(-this.maxRoll, this.roll));

        // yaw is qe
        if (this._inputInstance.isKeyDown("q")) {
            this.yaw += 1 * delta;
        } else if (this._inputInstance.isKeyDown("e")) {
            this.yaw -= 1 * delta;
        } else {
            this.yaw = +zeroth.z;
        }

        // throttle is rf
        if (this._inputInstance.isKeyDown("r")) {
            this.throttle += 0.01;
        } else if (this._inputInstance.isKeyDown("f")) {
            this.throttle -= 0.01;
        } else {
            //this._craft._throttle *= 0.999 * (1.0/delta);
            //this._craft._throttle = 0;
        }

        this.gear = this._inputInstance.isKeyDown("g") ? 1 : 0;

        this.fire1 = this._inputInstance.isKeyDown("Control") ? 1 : 0;

        //this.fire1 = this._inputInstance.mouse.left ? 1 : this.fire1;
        this.fire2 = this._inputInstance.isKeyDown(" ") ? 1 : 0;
        this.fire3 = this._inputInstance.mouse.middle ? 1 : 0;

        this.throttle = Math.min(this._craft._maxThrottle, Math.max(this._craft._minThrottle, this.throttle));
        this._craft.setInputs(delta, this.pitch, this.roll, this.yaw, this.throttle, this._mouseTarget, this.fire1, this.fire2, this.fire3, this.gear);
    }

    pulse(delta) {
        this.handleInput(delta * 0.001);
        const cptf = this._craft._canPitch.toFixed(2);
        const cps = cptf < 0.5 ? `[${cptf}]!` : `${cptf}`;

        this._status = `${this.ignition}\n${this._craft._throttle.toFixed(2)}\n${(this._craft._speed * 100).toFixed(1)}\n${this._craft._altitude.toFixed(2)}\n${this._craft._heading.toFixed(0)}\n${cps}\n${this._craft._pitch.toFixed(2)}\n${this._craft._roll.toFixed(2)}\n100\n${this._craft._gear ? 1 : 0}\n${this._craft._flaps ? 1 : 0}\n:AMM\nMIS:\n${this._craft._rollAmt.toFixed(1)}`;
    }
    //console.log(this._status);

    selectNextTarget(target) {
        if (target.getMesh) {
            this._target = target.getMesh();
        }
    }
}

export default Player;