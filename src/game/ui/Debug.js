import { Control, Rectangle, TextBlock } from "@babylonjs/gui";
import CGUI from "./GUI";
import { Bus, EVT_DEBUG, EVT_DEBUGLINE, EVT_DEBUGVEC } from "../Bus";
import { MeshBuilder, Vector3 } from "@babylonjs/core";
import { gscene } from "../Global";

export default class Debug {

    _linesMesh;
    _linesOptions;
    _linesInstance;

    constructor() {
        this.setup()
        this._linesOptions = {
            points: [new Vector3(0,0,0), new Vector3(0,0,0)],
            updatable: true,
        }

        this._linesMesh = MeshBuilder.CreateLines("lines", this._linesOptions, gscene);

        Bus.subscribe(EVT_DEBUG, (data) => {
            this._text.text = data;
        });
        Bus.subscribe(EVT_DEBUGVEC, (data) => {
            this._text.text = Math.round(data.x * 100) / 100 + "," + Math.round(data.y * 100) / 100 + "," + Math.round(data.z * 100) / 100;
        });

        Bus.subscribe(EVT_DEBUGLINE, (data) => {
            this._linesOptions.points[0] = data.from;
            this._linesOptions.points[1] = data.to;
            this._linesOptions.instance = this._linesMesh;
            this._linesMesh = MeshBuilder.CreateLines("lines", this._linesOptions);
        })
    }

    setup() {
        this.gameUI = new Rectangle("status");
        this.gameUI.width = "800px";
        this.gameUI.height = "270px";
        this.gameUI.top = "10px";
        this.gameUI.left = "30px";
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
        gameText.text = "";
        gameText.color = "white";
        gameText.fontSize = 20;
        gameText.fontFamily = "Arial";
        gameText.top = "1px";
        gameText.left = "5px";
        gameText.width = "800px";
        gameText.height = "320px";
        gameText.outlineColor = "black";
        gameText.outlineWidth = 2;
        this.gameUI.addControl(gameText);
        gameText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        gameText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        gameText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        gameText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        this._text = gameText;
    }
}