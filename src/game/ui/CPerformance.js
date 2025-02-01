import { Rectangle, Control, TextBlock } from "@babylonjs/gui"; 
import { EngineInstrumentation, SceneInstrumentation } from "@babylonjs/core";
import CGUI from "./GUI";
import { gscene } from "../Global";

export class CPerformance {
    constructor(scene) {
        this.scene = gscene;
        // Instrumentation
        this.instrumentation = new EngineInstrumentation(this.scene.getEngine());
        this.instrumentation.captureGPUFrameTime = true;
        this.instrumentation.captureShaderCompilationTime = true;

        this.sceneInstrumentation = new SceneInstrumentation(this.scene);

        // Create a container for instrumentation
        var perfContainer = new Rectangle("perfcontainer");
        perfContainer.width = "150px";
        perfContainer.height = "60px";
        perfContainer.cornerRadius = 5;
        perfContainer.color = "black";
        perfContainer.thickness = 1;
        perfContainer.background = "black";
        perfContainer.alpha = 0.9;
        CGUI.adt.addControl(perfContainer);
        perfContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        perfContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        perfContainer.top = "0px";
        perfContainer.left = "-10px";
        perfContainer.zIndex = 1000;


        // Create a text label for FPS
        var fpsLabel = new TextBlock();
        fpsLabel.text = "FPS: ";
        fpsLabel.color = "white";
        fpsLabel.fontSize = 12;
        fpsLabel.fontFamily = "Arial";
        fpsLabel.top = "1px";
        fpsLabel.left = "5px";
        fpsLabel.width = 1;
        fpsLabel.height = "40px"
        perfContainer.addControl(fpsLabel);
        fpsLabel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        fpsLabel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        // Create a text label for GPU frame time
        var gpuFrameTimeLabel = new TextBlock();
        gpuFrameTimeLabel.text = "GPU: ";
        gpuFrameTimeLabel.color = "white";
        gpuFrameTimeLabel.fontSize = 12;
        gpuFrameTimeLabel.fontFamily = "Arial";
        gpuFrameTimeLabel.top = "18px";
        gpuFrameTimeLabel.left = "5px";
        gpuFrameTimeLabel.width = 1;
        gpuFrameTimeLabel.height = "40px"
        perfContainer.addControl(gpuFrameTimeLabel);
        gpuFrameTimeLabel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        gpuFrameTimeLabel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        // update the fps and gpu time labels
        this.scene.registerAfterRender(() => {
            fpsLabel.text = "FPS: " + this.scene.getEngine().getFps().toFixed(1) + "  DC: " + this.sceneInstrumentation.drawCallsCounter.current.toFixed();
            gpuFrameTimeLabel.text = "GPU: " + (this.instrumentation.gpuFrameTimeCounter.average * 0.000001).toFixed(1) + " ms";
        });
    }
}