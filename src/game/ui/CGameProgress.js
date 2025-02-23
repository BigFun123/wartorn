import { Control, Rectangle, TextBlock } from "@babylonjs/gui";
import { GameScoreA, GameScoreB, PrimaryLayer } from "../Global";
import CGUI from "./GUI";

export class CGameProgress {
    constructor() {
        this.gameUI = null;
        this.setup();
    }
    setup() {
        this.gameUI = new Rectangle("gameprogress");

        this.gameUI.layerMask = PrimaryLayer;
        this.gameUI.width = "100px";
        this.gameUI.height = "20px";
        this.gameUI.top = "1px";
        this.gameUI.cornerRadius = 0;
        this.gameUI.color = "blue";
        this.gameUI.thickness = 0;
        this.gameUI.background = "rgb(0,0,0,0.0)";
        //this.gameUI.alpha = 0.9;
        this.gameUI.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.gameUI.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.gameUI.isVisible = true;
        CGUI.adt.addControl(this.gameUI);

        this.g2 = CGUI.createRect("gameprogress2", "50px", "20px", "0px", "0px", "rgb(1,0,0,1.0)", "rgb(0,0,255,1.0)", 0, 1, true);
        CGUI.adt.addControl(this.g2);
        this.g3 = CGUI.createRect("gameprogress2", "50px", "20px", "0px", "50px", "rgb(1,0,0,1.0)", "rgb(255,0,0,1.0)", 0, 1, true);
        CGUI.adt.addControl(this.g3);
        
        let gameText = CGUI.createText("gameprogress", "0", "white", "12px", "Arial", "0px", "0px", "100px", "20px", "black", 2, "rgb(0,0,0,1.0)", true);
        this.g2.addControl(gameText);
        
        let gameText2 = CGUI.createText("gameprogress", "0", "white", "12px", "Arial", "0px", "0px", "100px", "20px", "black", 2, "rgb(0,0,0,1.0)", true);
        this.g3.addControl(gameText2);
        


        setInterval(() => {
            gameText.text = GameScoreA;
            gameText2.text = GameScoreB;
        }, 3000);
    }
}