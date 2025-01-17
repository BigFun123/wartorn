import { GPUPicker, Matrix, MeshBuilder } from "@babylonjs/core";
import { gscene } from "./Global";
import { Bus, EVT_CURSOR3D, EVT_DEBUG } from "./Bus";

export default class CCursor {

    constructor() {
        this._cursor = null;
    }

    setup() {
        this._cursor = MeshBuilder.CreateSphere("cursor", { diameter: 0.1 }, gscene);
        this._cursor.isVisible = false;

        var picker = new GPUPicker();
        picker.setPickingList(gscene.meshes);

        gscene.onBeforeRenderObservable.add(() => {
            if (gscene.activeCamera) {
                let ray = gscene.createPickingRay(gscene.pointerX, gscene.pointerY, Matrix.Identity(), gscene.activeCamera, false);
                this._cursor.isVisible = false;
                let hit = gscene.pickWithRay(ray);
                if (hit.hit) {
                    this._cursor.position = hit.pickedPoint;
                    this._cursor.isVisible = true;
                    //Bus.send(EVT_DEBUG, hit.pickedPoint.x.toFixed(2) + "," + hit.pickedPoint.y.toFixed(2) + "," + hit.pickedPoint.z.toFixed(2));
                }
                Bus.send(EVT_CURSOR3D, hit)
            }
        });


    }
}