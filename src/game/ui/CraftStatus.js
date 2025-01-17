import { Control, Rectangle, TextBlock } from "@babylonjs/gui";
import CGUI from "./GUI";
import { gplayer } from "../Global";

class CraftStatus {
    constructor() {
        this.craftStatus = document.getElementById('craft-status');
        this.setup();
    }

    setup() {        
            this.gameUI = new Rectangle("status");
            this.gameUI.width = "100px";
            this.gameUI.height = "270px";
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
            gameText.text = "IGN\nTHR\nSPD\nALT\nHDG\nPR\nPIT\nROL\nFUEL\nGEAR\nFLAPS\n:AMM\nMIS:\n\n\n\n";
            gameText.text += "YAW\nPIT\nROL\nVER\nHOR\n";
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
            gameText2.text = "0\n0\n0\n0\n0\n0\n0\n0\n0\n0\n:~\n~\n\n\n\n";
            gameText2.text = "0\n0\n0\n0";
            gameText2.color = "white";
            gameText2.fontSize = 12;
            gameText2.fontFamily = "Arial";
            gameText2.top = "1px";
            gameText2.left = "-30px";
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
    }

    update() {
        if (gplayer) {
            this.statusText.text = gplayer._status;
        }
        //this.craftStatus.innerHTML = craft.status;
    }
}

export default CraftStatus;