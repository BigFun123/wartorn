import { ArcFollowCamera, FollowCamera, FreeCamera, TransformNode, Vector3 } from "@babylonjs/core";
import { gplayer, gscene } from "./Global";
import { Bus, EVT_PLAYERCREATED, EVT_PLAYERUPDATE } from "./Bus";

let cameraMode = "free";
let camera = null;
let cameras = ["free", "follow", "chase"];
let cameraCurrent = 0;
let oldCameraPos = new Vector3(0, 0, 0);
let observable = null;

export function setupFreeCamera() {
    removeCamera();
    camera = new FreeCamera("camera1", new Vector3(0, 5, -10), gscene);

    // This targets the camera to scene origin
    camera.setTarget(Vector3.Zero());

    const canvas = gscene.getEngine().getRenderingCanvas();

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);
}

export function setupFollowCamera() {
    removeCamera();
    camera = new FollowCamera("camera1", new Vector3(0, 5, -3), gscene, gplayer._craft._mesh);
    camera.radius = 6;
    camera.heightOffset = 2;
    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 10;
    camera.ellipsoid = new Vector3(1, 1, 1);
    // camera.rotationOffset = 0;
    // camera.cameraAcceleration = 0.11;
    // camera.maxCameraSpeed = 5;
    camera.panningSensibility = 2.50;
    camera.inputs.attached.pointers.angularSensibilityX = 20;
    camera.inputs.attached.pointers.angularSensibilityY = 30;
    camera.checkCollisions = true;


    // This targets the camera to scene origin
    // This attaches the camera to the canvas
    const canvas = gscene.getEngine().getRenderingCanvas();
    camera.attachControl(canvas, true);
    camera.lockedTarget = gplayer._craft._mesh;
}

export function setupChaseCam() {
    removeCamera();
    camera = new FollowCamera("camera1", new Vector3(0, 3, -2), gscene, gplayer._craft._mesh);
    
    camera.lowerRadiusLimit = 3;
    camera.upperRadiusLimit = 10;
    camera.radius = 4;
    // camera.heightOffset = 5;
    // camera.rotationOffset = 0;
    // camera.cameraAcceleration = 0.11;
    // camera.maxCameraSpeed = 5;
    camera.panningSensibility = 2.50;
    camera.inputs.attached.pointers.angularSensibilityX = 20;
    camera.inputs.attached.pointers.angularSensibilityY = 30;
    camera.checkCollisions = true;
    camera.ellipsoid = new Vector3(1, 1, 1);


    // This targets the camera to scene origin
    // This attaches the camera to the canvas
    const canvas = gscene.getEngine().getRenderingCanvas();
    camera.attachControl(canvas, true);
    camera.lockedTarget = gplayer._craft._mesh;

    observable = gscene.onBeforeRenderObservable.add(() => {
        if (camera === null) {
            return;
        }
        camera.radius = 1;
        camera.heightOffset = 1;
        camera.rotationOffset = 0;
    });
}

function setCamera() {

    switch (cameras[cameraCurrent]) {
        case "free":
            setupFreeCamera();
            camera.position = oldCameraPos.add(new Vector3(-10, 10, -10));
            break;
        case "follow":
            setupFollowCamera();
            //camera.position = oldCameraPos;
            break;
        case "chase":
            setupChaseCam();
            //camera.position = oldCameraPos;
            break;
        default:
            break;
    }

    
}

function removeCamera() {
    const canvas = gscene.getEngine().getRenderingCanvas();    
    if (observable) {
        gscene.onBeforeRenderObservable.remove(observable);
    }
    
    if (camera !== null) {
        camera.detachControl();
        oldCameraPos = camera.position;
        camera.dispose();
    }
}

Bus.subscribe("keydown", (key) => {
    console.log(key);
    if (key.code === "BracketRight") {
        cameraCurrent++;
        if (cameraCurrent >= cameras.length) {
            cameraCurrent = 0;
        }
        setCamera();
    }

    if (key.code === "BracketLeft") {
        cameraCurrent--;
        if (cameraCurrent < 0) {
            cameraCurrent = cameras.length - 1;
        }
        setCamera();
    }


});

Bus.subscribe(EVT_PLAYERCREATED, (data) => {
    setupFollowCamera();
})

