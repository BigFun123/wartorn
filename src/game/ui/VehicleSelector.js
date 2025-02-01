import { Control, Grid, Rectangle } from "@babylonjs/gui";
import { Bus, EVT_ERROR, EVT_LOADMISSION, EVT_LOADVEHICLE, EVT_SELECTVEHICLE, EVT_VEHICLESELECTED } from "../Bus";
import CGUI from "./GUI";

export default class VehicleSelector {
    vehicles = [];

    constructor() {
        this.vehicles = null;
    }

    async setup() {
        await this.loadVehicles();
        this.setupGUI();
        this.setupVehicles(this.vehicles);

        Bus.subscribe(EVT_SELECTVEHICLE, () => {
            this.gameUI.isVisible = true;
        });
    }

    loadVehicles() {
        return fetch("/assets/vehicles/index.json")
            .then((response) => response.json())
            .then((data) => {
                this.vehicles = data;
                console.log(data);
            })
            .catch((error) => {
                Bus.send(EVT_ERROR, "Failed to load vehicle index");
            });
    }

    setupGUI() {
        this.gameUI = new Rectangle("vehicles");
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
        const grid = new Grid("vehiclegrid");
        this.gameUI.addControl(grid);
        grid.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        grid.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

        grid.width = 1;
        grid.height = 1;
        grid.left = "132px";
        grid.top = "32px";
        this.grid = grid;

    }


    setupVehicles(data) {

        let totalground = 0;
        let totalair = 0;
        let totalsea = 0;

        this.grid.addColumnDefinition(200, true);
        this.grid.addColumnDefinition(200, true);
        this.grid.addColumnDefinition(200, true);

        for (let i = 0; i < data.length; i++) {
            const vehicle = data[i]
            this.grid.addRowDefinition(200, true);
            const button = CGUI.createImageButton("assets/vehicles/" + vehicle.icon, vehicle.name, 1, 1, () => {
                this.gameUI.isVisible = false;
                Bus.send(EVT_VEHICLESELECTED, vehicle);
            });
            if (vehicle.type === "aircraft") {
                button.color = "blue";
                this.grid.addControl(button, totalair++, 0);
            }
            if (vehicle.type === "ground") {
                button.color = "blue";
                this.grid.addControl(button, totalground++, 1);
            }
        }
    }
}