import { Color3, GlowLayer, HemisphericLight, Scene, ShadowGenerator, SpotLight, Vector3 } from "@babylonjs/core";
import { gplayer, gscene, gshadowgen, PrimaryLayer, setShadowGen } from "./Global";
import { Bus, EVT_ADDSHADOW, EVT_REMOVESHADOW } from "./Bus";

class CRender {
    constructor() {
        this.enableShadows();
        this.setupGlow();
        this.setupFog();
        Bus.subscribe(EVT_ADDSHADOW, this.addShadowCaster.bind(this));
        Bus.subscribe(EVT_REMOVESHADOW, this.removeShadowCaster.bind(this));
    }

    setupFog() {
        gscene.fogMode = Scene.FOGMODE_EXP2;
        gscene.fogColor = new Color3(184 / 255.0, 206 / 255.0, 215 / 255.0);
        gscene.fogDensity = 0.0008;
    }

    enableShadows() {
        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        this._light = new HemisphericLight("light", new Vector3(0.1, 0.9, 0.1), gscene);

        // Default intensity is 1. Let's dim the light a small amount
        this._light.intensity = 0.97;


        var light = new SpotLight("spotLight", new Vector3(3, 26, 3), new Vector3(-0.15, -1, 0), Math.PI / 3, 30, gscene);
        light.intensity = 1.6;
        light.shadowMinZ = 1;
        light.angle = 64 * Math.PI / 180;
        light.innerAngle = 117 * Math.PI / 180;
        light.shadowMaxZ = 50;
        light.darkness = 0.1;
        this.light = light;
        light.includeOnlyWithLayerMask = PrimaryLayer;


        gscene.onBeforeRenderObservable.add(() => {
            if (gplayer?._craft) {
                this.light.position = gplayer._craft._mesh.getAbsolutePosition().add(new Vector3(0, 9, 0));
            }
        });

        this.shadowGenerator = new ShadowGenerator(1024, this.light, true);
        let sg = this.shadowGenerator;
        this.shadowGenerator.usePoissonSampling = true;
        this.shadowGenerator.useExponentialShadowMap = false;
        // limit shadows to layermask = 0x01000000;
        this.shadowGenerator.layerMask = 0x01000000;

        /* sg.bias = 0.002;
         sg.normalBias = 0.2;
         sg.nearPlane = 0.1;
         sg.usePercentageCloserFiltering = true;
         sg.farPlane = 50;
         sg.darkness = 0.01;
 
         //sg.useBlurExponentialShadowMap = true;
         sg.useContactHardeningShadow = true;
         sg.contactHardeningLightSizeUVRatio = 0.0075;
         sg.blurKernel = 3;
         sg.blurScale = 2;
         sg.useKernelBlur = true;*/

        setShadowGen(sg);
    }

    addShadowCaster(mesh) {
        //this?.shadowGenerator?.getShadowMap()?.renderList?.push(mesh);
        this?.shadowGenerator?.addShadowCaster(mesh);
    }

    removeShadowCaster(mesh) {
        const index = this.shadowGenerator?.getShadowMap()?.renderList.indexOf(mesh);
        if (!index) {
            return;
        }
        this.shadowGenerator.getShadowMap().renderList.splice(index, 1);
    }

    setupGlow() {
        let gl = new GlowLayer("glow", gscene, {
            mainTextureFixedSize: 256,
            blurKernelSize: 32,
            renderingGroupId: 0
        });
    }
}

export default CRender;