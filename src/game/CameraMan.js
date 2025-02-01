import { ArcFollowCamera, Camera, FollowCamera, FreeCamera, Quaternion, TransformNode, UniversalCamera, Vector3, Viewport } from "@babylonjs/core";
import { gcursor, getPlayer, gplayer, gscene } from "./Global";
import { Bus, EVT_DEBUG, EVT_DEBUGVEC, EVT_KEYUP, EVT_PLAYERCREATED } from "./Bus";

let cameraMode = "free";
let camera = null;
let cameras = ["free", "follow", "chase", "cockpit"];
let cameraCurrent = 0;
let oldCameraPos = new Vector3(0, 0, 0);
let observable = null;
let cockpitCamPoint = null;
let miniMap = null;
let mmobservable = null;

export function setupFreeCamera() {
    removeCamera();
    camera = new FreeCamera("camera1", new Vector3(0, 5, -10), gscene);

    // This targets the camera to scene origin
    camera.setTarget(Vector3.Zero());

    const canvas = gscene.getEngine().getRenderingCanvas();

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    Bus.subscribe(EVT_KEYUP, e => {
        if (e.code === "NumpadMultiply") {
            camera.position = getPlayer()._craft._mesh.getAbsolutePosition().clone();
        }
        if (e.code === "Numpad5") {
            camera.position = gcursor._cursor.position.clone().add(new Vector3(0, 25, 0));
        }
    })
}

export function setupFollowCamera() {
    removeCamera();
    camera = new FollowCamera("camera1", new Vector3(0, 5, -3), gscene, getPlayer()._craft._mesh);
    camera.radius = 6;
    camera.heightOffset = 2;
    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 10;
    camera.ellipsoid = new Vector3(1, 1, 1);
    // camera.rotationOffset = 0;
    // camera.cameraAcceleration = 0.11;
    // camera.maxCameraSpeed = 5;
    camera.panningSensibility = 2.50;
    camera.inputs.attached.pointers.angularSensibilityX = 5;
    camera.inputs.attached.pointers.angularSensibilityY = 5;
    camera.checkCollisions = true;
    camera.layerMask = 0x4;


    // This targets the camera to scene origin
    // This attaches the camera to the canvas
    const canvas = gscene.getEngine().getRenderingCanvas();
    camera.attachControl(canvas, true);
    camera.lockedTarget = getPlayer()._craft._mesh;
    gscene.activeCameras.push(camera);    
    setupMiniMap();
}

export function setupChaseCam() {
    removeCamera();
    camera = new FollowCamera("camera1", new Vector3(0, 3, -2), gscene, getPlayer()._craft._mesh);

    camera.lowerRadiusLimit = 3;
    camera.upperRadiusLimit = 10;
    camera.radius = 4;
    // camera.heightOffset = 5;
    // camera.rotationOffset = 0;
    // camera.cameraAcceleration = 0.11;
     camera.maxCameraSpeed = 25;
    camera.panningSensibility = 2.50;
    camera.inputs.attached.pointers.angularSensibilityX = 20;
    camera.inputs.attached.pointers.angularSensibilityY = 30;
    camera.checkCollisions = true;
    camera.ellipsoid = new Vector3(1, 1, 1);


    // This targets the camera to scene origin
    // This attaches the camera to the canvas
    const canvas = gscene.getEngine().getRenderingCanvas();
    camera.attachControl(canvas, true);
    camera.lockedTarget = getPlayer()._craft._mesh;

    observable = gscene.onBeforeRenderObservable.add(() => {
        if (camera === null) {
            return;
        }
        camera.radius = 1;
        camera.heightOffset = 1;
        camera.rotationOffset = 0;
    });
}

function setupCockpitCam() {
    removeCamera();
    camera = new UniversalCamera("camera1", new Vector3(0, 0, 0), gscene );
    camera.farClipPlane = 1000000;
    const canvas = gscene.getEngine().getRenderingCanvas();
    camera.attachControl(canvas, true);
    let tn = new TransformNode("cockpitCam", gscene);
    //tn.rotationQuaternion = Quaternion.FromEulerAngles(0, Math.PI, 0);
    tn.scaling = new Vector3(1, 1, -1);
    camera.parent = tn;
    tn.parent = gplayer._craft.getCockpitCam();

    //cockpitCamPoint = getPlayer()._craft.getCockpitCam();
    getPlayer()._craft.showCockpit(true);

    observable = gscene.onBeforeRenderObservable.add(() => {
        /*if (camera === null) {
            return;
        }
        camera.position = cockpitCamPoint.getAbsolutePosition();
        let pr = gplayer._craft._mesh.rotationQuaternion;        
        pr = pr.multiply(Quaternion.FromEulerAngles(0, Math.PI, 0));
        let pre = pr.toEulerAngles();
        Bus.send(EVT_DEBUGVEC, pr);
        //const target = getPlayer()._craft.getCameraTarget().position;
        camera.rotation = new Vector3(pre.x, pre.y, -pre.z);
        //camera.setTarget(target);
        */
        
    });
}

function setCamera() {
    getPlayer()._craft.showCockpit(false);
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
        case "cockpit":
            setupCockpitCam();
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
    if (key.code === "KeyC") {
        cameraCurrent++;
        if (cameraCurrent >= cameras.length) {
            cameraCurrent = 0;
        }
        setCamera();
    }

    if (key.code === "KeyC" && key.shiftKey) {
        cameraCurrent--;
        if (cameraCurrent < 0) {
            cameraCurrent = cameras.length - 1;
        }
        setCamera();
    }


});

function setupMiniMap() {
    const height = 80;
    miniMap = new UniversalCamera("minimap", new Vector3(0, height, 0), gscene);
    miniMap.minZ = 1;
    miniMap.maxZ = height + 520;
    miniMap.rotation = new Vector3(Math.PI / 2, 0, 0);
    miniMap.fov = 0.5;
    miniMap.viewport = new Viewport(0.75, 0.75, 0.25, 0.25);
    miniMap.mode = Camera.ORTHOGRAPHIC_CAMERA;
    miniMap.orthoTop = 1000;
    miniMap.orthoBottom = 0;
    miniMap.orthoLeft = 0;
    miniMap.orthoRight = 1000;
    miniMap.layerMask = 0x1;
    miniMap.attachControl(gscene.getEngine().getRenderingCanvas(), true);
    gscene.activeCameras.push(miniMap);
    window.miniMap = miniMap;
    // create a layer maske than can only bee seen by a camera with layermask 0xF00
    

    mmobservable = gscene.onBeforeRenderObservable.add(() => {
        miniMap.position = getPlayer()._craft._mesh.getAbsolutePosition().add(new Vector3(0, height, 0));
    });
    
}

Bus.subscribe(EVT_PLAYERCREATED, (data) => {
    
    //setupFollowCamera();
    //setupMiniMap();
})

