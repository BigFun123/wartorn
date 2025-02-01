import { AdvancedDynamicTexture, Button, Control, Image, TextBlock } from "@babylonjs/gui";

const cornerRadius = 2;
const DIALOG_BORDER = "gray";
const DIALOG_BG = "rgb(20.6,20.6,20.6,1.0)";
const BUTTON_BG = "rgb(0.6,0.6,0.6,1.0)";

class CGUI {
  static adt;
  constructor() {
    this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    //if (CSettings.settings.useGUICam) {
    //  this.advancedTexture.layer.layerMask = 0x20000000;
    //}

    CGUI.adt = this.advancedTexture;
    this.advancedTexture.idealHeight = 780;
    this.advancedTexture.idealWidth = 1020;
    this.advancedTexture.renderAtIdealSize = true;
    this.advancedTexture.useInvalidateRectOptimization = true;
  }

  static createImageButton(image, text, width, height, onClick, bottomText) {
    let button = Button.CreateImageOnlyButton("button", image);
    button.width = width;
    button.height = height;
    button.color = "white";
    button.background = BUTTON_BG;
    button.onPointerUpObservable.add(onClick);
    let icon = button.getChildByName("but_icon");
    if (icon) {
      icon.stretch = Image.STRETCH_UNIFORM;
    }

    let textBlock = new TextBlock();
    textBlock.text = text;
    textBlock.color = "white";
    textBlock.fontSize = 14;
    textBlock.fontFamily = "Arial";
    textBlock.fontWeight = "bold";
    textBlock.left = "-3px";
    textBlock.outlineColor = "black";
    textBlock.outlineWidth = 2;
    button.addControl(textBlock);
    textBlock.width = 1;
    textBlock.height = 1;
    if (bottomText) {
      textBlock.top = "-3px";
      textBlock.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
      textBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
      textBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
      textBlock.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    } else {
      textBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
      textBlock.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    }


    return button;
  }
}

export default CGUI;