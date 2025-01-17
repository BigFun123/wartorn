import { Color3, CubeTexture, MeshBuilder, StandardMaterial, Texture, Vector2 } from "@babylonjs/core";
import { gscene } from "./Global";

class SkyBox {
    constructor() {
        this.setup();
    }

    setupSimpleSkybox() {
        var skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, gscene);
        var skyboxMaterial = new StandardMaterial("skyBox", gscene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new CubeTexture("assets/sky/skybox", gscene);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
    }

    setupRadianceSkybox() {
        // Skybox        
         var hdrTexture = CubeTexture.CreateFromPrefilteredData("/assets/sky/kloppenheim.env", gscene);
         let skybox = gscene.createDefaultSkybox(hdrTexture, false, 9000);
        // skybox.groundColor = new Color3(0.011764705882352941, 0.1803921568627451, 0.5529411764705883);
        // skybox.diffuseColor = new Color3(0.011764705882352941, 0.1803921568627451, 0.5529411764705883);
    }
    setup() {

        //this.setupSimpleSkybox();
        this.setupRadianceSkybox();

        //let skybox = MeshBuilder.CreateBox("skyBox", { size: 10000.0 }, scene);
        //var hdrTexture = new CubeTexture("/assets/sky/TropicalSunnyDay", gscene);
        // Skybox        
        // var hdrTexture = CubeTexture.CreateFromPrefilteredData("/assets/sky/skybox.dds", gscene);


        // let skybox = gscene.createDefaultSkybox(hdrTexture, false, 9000);

        // skybox.isPickable = false;
        // skybox.enableCollisions = false;
        // skybox.enablePhysics = false;
        // skybox.infiniteDistance = true;
        // //skybox.isVisible = false;
        // skybox.groundColor = new Color3(0.011764705882352941, 0.1803921568627451, 0.5529411764705883);
        // skybox.diffuseColor = new Color3(0.011764705882352941, 0.1803921568627451, 0.5529411764705883);



        /*var skyboxMaterial = new StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.disableLighting = true;
        skyboxMaterial.reflectionTexture = new CubeTexture(CSettings.settings.assetsFolder + "/sky/skybox", scene);
        //skyboxMaterial.reflectionTexture = new HDRCubeTexture(CSettings.settings.assetsFolder + "/skybox", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        skybox.material = skyboxMaterial;*/
        // skybox.receiveShadows = false;
        // skybox.isBlocker = false;
        // skybox.isBlockerMesh = false;
        // skybox.isPickable = false;
        // this.skybox = skybox;

        // Water
        // var waterMesh = MeshBuilder.CreateGround("waterMesh", 2048, 2048, 16, gscene, false);
        // var water = new WaterMaterial("water", gscene, new Vector2(512, 512));
        // water.backFaceCulling = true;
        // water.bumpTexture = new Texture("assets/textures/waterbump.png", gscene);
        // water.windForce = -10;
        // water.waveHeight = 1.7;
        // water.bumpHeight = 0.1;
        // water.windDirection = new Vector2(1, 1);
        // water.waterColor = new Color3(0, 0, 221 / 255);
        // water.colorBlendFactor = 0.0;
        // water.addToRenderList(skybox);
        // waterMesh.material = water;
    }
}

export default SkyBox;