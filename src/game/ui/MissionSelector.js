import { Control, Grid, Rectangle } from "@babylonjs/gui";
import { Bus, EVT_ERROR, EVT_LOADMISSION, EVT_MISSIONSELECTED, EVT_SELECTMISSION } from "../Bus";
import CGUI from "./GUI";

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
        this.gameUI.width = "1020px";
        this.gameUI.height = "770px";
        this.gameUI.top = "0";
        this.gameUI.left = "0";
        this.gameUI.cornerRadius = 0;
        this.gameUI.color = "black";
        this.gameUI.thickness = 0;
        this.gameUI.background = "rgb(0,0,0,0.5)";
        //this.gameUI.alpha = 0.9;
        this.gameUI.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.gameUI.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        CGUI.adt.addControl(this.gameUI);
        this.gameUI.isVisible = false;

        //misisons
        const grid = new Grid("missiongrid");
        this.gameUI.addControl(grid);
        grid.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        grid.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

        grid.width = 1;
        grid.height = 1;
        grid.left = "132px";
        grid.top = "32px";
        this.missionGrid = grid;

    }


    setupMissions(data) {

        let x = 0;
        let y = 0;

        this.missionGrid.addColumnDefinition(200, true);
        this.missionGrid.addColumnDefinition(200, true);
        this.missionGrid.addColumnDefinition(200, true);

        for (let i = 0; i < data.length; i++) {
            const mission = data[i]
            this.missionGrid.addRowDefinition(100, true);
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