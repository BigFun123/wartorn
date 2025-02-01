import { PointerEventTypes } from "@babylonjs/core";
import { Bus, EVT_KEYDOWN, EVT_KEYUP, EVT_MOUSEUP } from "./Bus";
import { gscene } from "./Global";

class Input {
    static _instance = null;

    constructor() {
        Input._instance = this;
        this.keys = {};
        this.mouse = {
            x: 0,
            y: 0,
            left: false,
            right: false,
            middle: false
        };
    }

    static getInstance( ){
        return Input._instance;
    }

    setup() {

        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            Bus.send(EVT_KEYDOWN, e);
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            Bus.send(EVT_KEYUP, e);
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.mouse.left = true;
            }
            else if (e.button === 1) {
                this.mouse.middle = true;
            }
            else if (e.button === 2) {
                this.mouse.right = true;
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.mouse.left = false;
            }
            else if (e.button === 1) {
                this.mouse.middle = false;

            } else if (e.button === 2) {
                this.mouse.right = false;
            }
        });

        gscene.onPointerObservable.add((pointerInfo) => {
            //console.log(pointerInfo.type);
            if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
                if (pointerInfo.event.button === 0) {
                    this.mouse.left = true;
                }
                else if (pointerInfo.event.button === 1) {
                    this.mouse.middle = true;
                }
                else if (pointerInfo.event.button === 2) {
                    this.mouse.right = true;
                }
            } else if (pointerInfo.type === PointerEventTypes.POINTERUP) {
                if (pointerInfo.event.button === 0) {
                    this.mouse.left = false;
                }
                else if (pointerInfo.event.button === 1) {
                    this.mouse.middle = false;
                }
                else if (pointerInfo.event.button === 2) {
                    this.mouse.right = false;
                }
                Bus.send(EVT_MOUSEUP, this.mouse);
            }
        });
    }

    isKeyDown(key) {
        return this.keys[key] || false;
    }

    isMouseLeft() {
        return this.mouse.left;
    }

    isMouseRight() {
        return this.mouse.right;
    }

    getMouseX() {
        return this.mouse.x;
    }

    getMouseY() {
        return this.mouse.y;
    }

    pulse() {
        this.mouse.left = false;
        this.mouse.right = false;
    }
}

export default Input;