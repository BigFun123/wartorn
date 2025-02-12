import { Control, Rectangle, TextBlock } from "@babylonjs/gui";
import CGUI from "./GUI";
import { gplayer, PrimaryLayer } from "../Global";
import { Quaternion } from "@babylonjs/core";
import { Bus, EVT_NEXTTARGET_SELECTED, EVT_PLAYERCREATED, EVT_PLAYERUPDATE, EVT_SELECTNEXTTARGET } from "../Bus";

const altimeter = {
    needle1: "ALT.Needle1",
    needle2: "ALT.Needle2",
    needle3: "ALT.Needle3",
    originalRotation: Quaternion.FromEulerAngles(0, 0, 0),
}

class CraftStatus {
    _currentTarget = null;
    constructor() {        
        this.setup();

        Bus.subscribe(EVT_PLAYERCREATED, () => {
            this.setupAltimeter();
        });

        Bus.subscribe(EVT_NEXTTARGET_SELECTED, (target) => {
            this._currentTarget.text = target?._go?.name;
        })
    }

    setup() {
        this.gameUI = new Rectangle("status");
        // only show on camera1
        //00000000 0
        //00000001 1
        //00000010 2
        //00000011 3
        //00000100 4
        //00000101 5
        //00000110 6
        //00000111 7
        //00001000 8
        window.gameUI = this.gameUI;

        this.gameUI.layerMask = PrimaryLayer;
        this.gameUI.width = "100px";
        this.gameUI.height = "290px";
        this.gameUI.top = "50px";
        this.gameUI.cornerRadius = 0;
        this.gameUI.color = "black";
        this.gameUI.thickness = 0;
        this.gameUI.background = "rgb(0,0,0,0)";
        //this.gameUI.alpha = 0.9;
        this.gameUI.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.gameUI.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        CGUI.adt.addControl(this.gameUI);
        this.gameUI.isVisible = true;


        let gameText = new TextBlock("statuslabel");
        gameText.text = "IGN\nTHR\nSPD\nALT\nHDG\nPR\nPIT\nROL\nFUEL\nGEAR\nFLAPS\nAMM\nMIS\n";
        //gameText.text += "YAW\nPIT\nROL\nVER\nHOR\n";
        gameText.color = "white";
        gameText.fontSize = 12;
        gameText.fontFamily = "Arial";
        gameText.top = "1px";
        gameText.left = "5px";
        gameText.width = "100px";
        gameText.height = "320px";
        gameText.outlineColor = "black";
        gameText.outlineWidth = 2;
        this.gameUI.addControl(gameText);
        gameText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        gameText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        gameText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        gameText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        let gameText2 = new TextBlock("craftstatus");
        gameText2.layerMask = PrimaryLayer;
        gameText2.text = "0\n0\n0\n0\n0\n0\n0\n0\n0\n0\n1\n0\n0";
        //gameText2.text = "0\n0\n0\n0";
        gameText2.color = "white";
        gameText2.fontSize = 12;
        gameText2.fontFamily = "Arial";
        gameText2.top = "1px";
        gameText2.left = "-35px";
        gameText2.width = "70px";
        gameText2.height = "320px";
        gameText2.outlineColor = "black";
        gameText2.outlineWidth = 2;
        this.gameUI.addControl(gameText2);
        gameText2.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        gameText2.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        gameText2.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        gameText2.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.statusText = gameText2;

        let currentTarget = new TextBlock("currentTarget");
        currentTarget.layerMask = PrimaryLayer;
        currentTarget.text = "Target";
        currentTarget.color = "white";
        currentTarget.fontSize = 12;
        currentTarget.fontFamily = "Arial";
        currentTarget.top = "1px";
        currentTarget.left = "5px";
        currentTarget.width = "100px";
        currentTarget.height = "320px";
        currentTarget.outlineColor = "black";
        currentTarget.outlineWidth = 2;
        CGUI.adt.addControl(currentTarget);
        currentTarget.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        currentTarget.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        currentTarget.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        currentTarget.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this._currentTarget = currentTarget;
    }

    update() {
        if (gplayer) {
            this.statusText.text = gplayer._status + "\n\n" + gplayer.tileX +"\n" + gplayer.tileY + "\n" 
            + gplayer._craft._mesh.aggregate?.transformNode.position.x.toFixed(2) + "\n" + gplayer._craft._mesh.aggregate?.transformNode.position.z.toFixed(2);  
            this.altitude = gplayer._craft._mesh.aggregate?.transformNode.position.y * 0.1;

            if (altimeter.altNeedle1) {
                altimeter.altNeedle1.rotationQuaternion = Quaternion.FromEulerAngles(0, 0, -1 * this.altitude);
            }
            if (altimeter.altNeedle2) {
                altimeter.altNeedle2.rotationQuaternion = Quaternion.FromEulerAngles(0, 0, -0.1 * this.altitude)
            }
            if (this.altNeedle3) {
                altimeter.altNeedle3.rotationQuaternion = Quaternion.FromEulerAngles(0, 0, -0.01 * this.altitude)
            }
        }
        //this.craftStatus.innerHTML = craft.status;
    }

    setupAltimeter() {
        // find mesh named ALT.Needle1
        // find mesh named ALT.Needle2
        // find mesh named ALT.Needle3

        gplayer._craft._mesh.getChildMeshes().forEach((m) => {
            if (m.name == altimeter.needle1) {
                altimeter.altNeedle1 = m;
                altimeter.altNeedle1.originalRotation = m.rotationQuaternion.clone();
            }
            if (m.name == altimeter.needle2) {
                altimeter.altNeedle2 = m;
                altimeter.altNeedle2.originalRotation = m.rotationQuaternion.clone();
            }
            if (m.name == altimeter.needle3) {
                altimeter.altNeedle3 = m;
                altimeter.altNeedle3.originalRotation = m.rotationQuaternion.clone();
            }
        });
    }
}

export default CraftStatus;