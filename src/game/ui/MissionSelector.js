import { Control, Grid, Rectangle } from "@babylonjs/gui";
import { Bus, EVT_ERROR, EVT_LOADMISSION, EVT_MISSIONSELECTED, EVT_SELECTMISSION } from "../Bus";
import CGUI from "./GUI";
import { CanvasHeight, CanvasWidth } from "../Global";

export default class MissionSelector {
    missions = [];

    constructor() {
        this.mission = null;

    }

    async setup() {
        this.setupGUI();
        Bus.subscribe(EVT_SELECTMISSION, () => {
            this.gameUI.isVisible = true;
        });

        await this.loadMissions();

        this.setupMissions(this.missions);

    }

    loadMissions() {
        return fetch("/assets/missions/index.json")
            .then((response) => response.json())
            .then((data) => {
                this.missions = data;
                console.log(data);
            })
            .catch((error) => {
                Bus.send(EVT_ERROR, "Failed to load mission index");
            });
    }

    setupGUI() {
        this.gameUI = new Rectangle("mission");
        this.gameUI.width = CanvasWidth + "px";
        this.gameUI.height = CanvasHeight + "px";
        this.gameUI.cornerRadius = 0;
        this.gameUI.color = "black";
        this.gameUI.thickness = 0;
        this.gameUI.background = "rgb(0,0,0,0.5)";
        //this.gameUI.alpha = 0.9;        
        CGUI.adt.addControl(this.gameUI);
        this.gameUI.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.gameUI.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.gameUI.isVisible = false;

        //misisons
        const grid = new Grid("missiongrid");
        this.gameUI.addControl(grid);
        grid.width = 1;
        grid.height = 1;
        grid.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        grid.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;


        this.missionGrid = grid;

    }


    setupMissions(data) {

        let x = 0;
        let y = 0;

        this.missionGrid.addColumnDefinition(0.33, false);
        this.missionGrid.addColumnDefinition(0.33, false);
        this.missionGrid.addColumnDefinition(0.33, false);

        const rowCount = data.length / 3;
        const rowHeight = (CanvasHeight / rowCount) / CanvasHeight;
        this.missionGrid.addRowDefinition(rowHeight, false);
        this.missionGrid.addRowDefinition(rowHeight, false);
        this.missionGrid.addRowDefinition(rowHeight, false);

        
        for (let i = 0; i < data.length; i++) {
            const mission = data[i]
            const button = CGUI.createImageButton("assets/missions/" + mission.icon, mission.name, 1, 1, () => {
                this.gameUI.isVisible = false;
                Bus.send(EVT_MISSIONSELECTED, mission);
            });
            this.missionGrid.addControl(button, y, x);
            y++;
            if (y > 2) {

                y = 0;
                x++;
            }
        }
    }
}