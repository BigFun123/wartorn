export const EVT_DEBUG = "debug";
export const EVT_DEBUGVEC = "debugvec";
export const EVT_DEBUGLINE = "debuglin";
export const EVT_DEBUG_NEXTTARGET = "debugnexttarget";
export const EVT_DEBUG_PREVTARGET = "debugprevtarget";


export const EVT_ERROR = "error";
export const EVT_RESET = "reset";
export const EVT_PAUSE = "pause";
export const EVT_RESUME = "resume";
export const EVT_SETPLAYER = "setplayer";
export const EVT_SHOWPOS = "showpos";
export const EVT_SETSTATE = "setstate";
export const EVT_PROGRESS = "progress";  // {text: "Loading", progress: 0-100}

export const EVT_PLAYERCREATED = "playercreated";
export const EVT_PLAYERLOADED = "playerloaded";
export const EVT_WORLDLOADED = "worldloaded";
export const EVT_PLAYERUPDATE = "playerupdate";

export const EVT_SELECTMISSION = "selectmission";
export const EVT_MISSIONSELECTED = "selectedmission";
export const EVT_LOADMISSION = "loadmission";
export const EVT_MISSIONLOADED = "missionloaded";

export const EVT_SELECTVEHICLE = "selectvehicle";
export const EVT_VEHICLESELECTED = "selectedvehicle";
export const EVT_VEHICLEPREPARED = "selectedprepared";
export const EVT_LOADVEHICLE = "loadvehicle";
export const EVT_VEHICLELOADED = "vehicleloaded";

export const EVT_SELECTNEXTTARGET = "selectnexttarget";
export const EVT_SELECTPREVTARGET = "selectprevtarget";
export const EVT_SETCAMERATARGET = "setcameratarget";

export const EVT_NEXTTARGET_SELECTED = "nexttarget_selected";


export const EVT_SETVOLUME = "setvolume";
export const EVT_FOG = "fog";
export const EVT_CAMERA = "camera";
export const EVT_DESTROYED = "destroyed";

export const EVT_PLAY3DAUDIO = "play3daudio";
export const EVT_SHOWGIZMO = "showgizmo";

export const EVT_ADD_RADAR = "add-radar-item";
export const EVT_SELECT_PILOT = "select-pilot";
export const EVT_PILOT_SELECTED = "selected-pilot";

export const EVT_LOGIN = "login";
export const EVT_ADDSHADOW = "addshadow";
export const EVT_REMOVESHADOW = "removeshadow";

export const EVT_KEYUP = "keyup";
export const EVT_KEYDOWN = "keydown";
export const EVT_CURSOR3D  = "cursor3d";
export const EVT_MOUSEUP = "mouseup";

export const EVT_EXPORT = "export";

export class Bus {
    static subscribers = {};
    static startime = 0;

    static subscribe(event, callback) {        
        if (!this.subscribers[event]) {            
            this.subscribers[event] = [];
        }
        this.subscribers[event].push(callback);
        Bus.startime = Date.now();
    }

    static send(event, data) {
        if (!this.subscribers[event]) {
            return;
        }
        // output current ms
        //console.log(event, Date.now() - Bus.startime);
        this.subscribers[event].forEach(callback => callback(data));
    }
}