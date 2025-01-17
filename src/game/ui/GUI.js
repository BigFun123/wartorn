import { AdvancedDynamicTexture } from "@babylonjs/gui";

class CGUI {
    static adt;
    constructor() {
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        //if (CSettings.settings.useGUICam) {
          //  this.advancedTexture.layer.layerMask = 0x20000000;
        //}

        CGUI.adt = this.advancedTexture;
        this.advancedTexture.idealHeight = 780;
        this.advancedTexture.idealWidth = 1920;
        this.advancedTexture.renderAtIdealSize = true;
        this.advancedTexture.useInvalidateRectOptimization = true;
    }
}

export default CGUI;