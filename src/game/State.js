import { Bus, EVT_KEYDOWN, EVT_KEYUP, EVT_SETSTATE } from "./Bus";

class State {
    page = "game";
    paused = false;

    constructor() {
        console.log("State constructor");
        Bus.subscribe(EVT_SETSTATE, this.setState);
        /*Bus.subscribe(EVT_KEYUP, (key) => {
            if (key.code === "Escape") {
                if (this.page === "menu") {                    
                    this.page = "game";
                    this.paused = false;
                } else {
                    this.paused = true;
                    this.page = "menu";
                }
                Bus.send(EVT_SETSTATE, this);
            }
        });*/
    }



    setState = (data) => {
        console.log("prev", this.page, this.paused);
        this.page = data.page;
        this.paused = data.paused;
        console.log("new", this.page, this.paused);
    }
}

const stateInstance = new State();
export default stateInstance;