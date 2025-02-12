import { Bus, EVT_DEBUG, EVT_KEYDOWN, EVT_KEYUP, EVT_LOADMISSION, EVT_LOADVEHICLE, EVT_MISSIONSELECTED, EVT_SELECTMISSION, EVT_SELECTVEHICLE, EVT_SETSTATE, EVT_VEHICLELOADED, EVT_VEHICLEPREPARED, EVT_VEHICLESELECTED } from "./Bus";

/**
 * load basic assets
 * select mission 
 * select vehicle
 * load mission assets
 * load vehicle assets
 * game
 * stream extra assets
 * menu
 */


const STATE_INIT = "init";
const STATE_LOADING = "loading";
const STATE_MENU = "menu";
const STATE_GAME = "game";
const STATE_PAUSE = "pause";
const STATE_MISSIONSELECT = "missionselect";
const STATE_VEHICLESELECT = "vehicleselect";
const STATE_MISSIONLOAD = "missionload";
const STATE_VEHICLELOAD = "vehicleload";
const STATE_STREAM = "stream";


class State {
    state = STATE_INIT;
    paused = false;
    debug = true;

    constructor() {
        console.log("State constructor");
        Bus.subscribe(EVT_SETSTATE, this.setState);
        Bus.subscribe(EVT_MISSIONSELECTED, (mission) => {
            this.setState(STATE_VEHICLESELECT);
        })
        Bus.subscribe(EVT_VEHICLESELECTED, (vehicle) => {
            
        });

        Bus.subscribe(EVT_VEHICLEPREPARED, () => {
            this.setState(STATE_MISSIONLOAD);
        });
    }

    setup() {
        Bus.send(EVT_DEBUG, "State initialized");
        this.setState(STATE_MISSIONSELECT);
    }

    getState() {
        return this.state;
    }


    setState = (data) => {
        Bus.send(EVT_DEBUG, "State change to " + data);
        console.log("prev", data);
        this.state = data;
        console.log("new", data);

        switch (this.state) {
            case STATE_MISSIONSELECT:
                Bus.send(EVT_SELECTMISSION, {});
                break;
            case STATE_VEHICLESELECT:
                Bus.send(EVT_SELECTVEHICLE, {});
                break;
            case STATE_MISSIONLOAD:
                Bus.send(EVT_LOADMISSION, {});
                break;
        }
    }
}

const stateInstance = new State();
export default stateInstance;