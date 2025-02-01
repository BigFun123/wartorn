import { Control, Rectangle, TextBlock } from "@babylonjs/gui";
import CGUI from "./GUI";
import { Bus, EVT_ERROR, EVT_PROGRESS } from "../Bus";

function initProgress() {

    let progressTimer = 0;

    const gameUI = new Rectangle("progress");
    gameUI.width = "500px";
    gameUI.height = "50px";
    gameUI.top = "20px";
    gameUI.cornerRadius = 20;
    gameUI.color = "black";
    gameUI.thickness = 0;
    gameUI.background = "rgb(0,0,0,0.5)";
    //gameUI.alpha = 0.9;
    gameUI.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    gameUI.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    CGUI.adt.addControl(gameUI);
    gameUI.isVisible = false;
    
    
    const gameText = new TextBlock("statuslabel");
    gameText.text = "Loading";
    gameText.color = "white";
    gameText.fontSize = 12;
    gameText.fontFamily = "Arial";
    gameText.top = "10px";
    gameText.left = "5px";
    gameText.width = "200px";
    gameText.height = "32px";
    gameText.outlineColor = "black";
    gameText.outlineWidth = 2;
    gameUI.addControl(gameText);
    gameText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    gameText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    gameText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    gameText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;


    const errorText = new TextBlock("statuslabel");
    errorText.text = "Loading";
    errorText.color = "magenta";
    errorText.fontSize = 12;
    errorText.fontFamily = "Arial";
    errorText.top = "21px";
    errorText.left = "5px";
    errorText.width = "200px";
    errorText.height = "32px";
    gameUI.addControl(errorText);
    errorText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    errorText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    errorText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    errorText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;


    Bus.subscribe(EVT_PROGRESS, (data) => {
        gameText.text = data.text + " " + data.progress + "%";
        gameUI.isVisible = true;
        if (progressTimer) {
            clearTimeout(progressTimer);
        }
        progressTimer = setTimeout(() => {
            gameUI.isVisible = false;
        }, 10000);
    });

    Bus.subscribe(EVT_ERROR, (data) => {
        errorText.text = data;
        gameUI.isVisible = true;
    });
    
}


export { initProgress };