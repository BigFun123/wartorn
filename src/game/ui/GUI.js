import { AdvancedDynamicTexture, Button, Control, Image, Rectangle, TextBlock } from "@babylonjs/gui";
import { CanvasHeight, CanvasWidth, PrimaryLayer, SecondaryLayer } from "../Global";

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
    CGUI.adt.layer.layerMask = PrimaryLayer;
    this.advancedTexture.idealWidth = CanvasWidth;
    this.advancedTexture.idealHeight = CanvasHeight;
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

  static createRect(name, width, height, top, left, color, bg, thickness, alpha, isVisible) {
    let rect = new Rectangle(name);
    rect.width = width;
    rect.height = height;
    rect.top = top;
    rect.left = left;
    rect.color = color;
    rect.thickness = thickness;
    rect.background = bg;
    rect.alpha = alpha;
    rect.isVisible = isVisible;
    rect.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    rect.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    return rect;
  }

  static createText(name, text, color, fontSize, fontFamily, top, left, width, height, outlineColor, outlineWidth, bg, isVisible) {
    let textBlock = new TextBlock(name);
    textBlock.text = text;
    textBlock.color = color;
    textBlock.fontSize = fontSize;
    textBlock.fontFamily = fontFamily;
    textBlock.top = top;
    textBlock.left = left;
    textBlock.width = width;
    textBlock.height = height;
    textBlock.outlineColor = outlineColor;
    textBlock.outlineWidth = outlineWidth;
    textBlock.background = bg;
    textBlock.isVisible = isVisible;
    textBlock.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    textBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    textBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    textBlock.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    return textBlock;
  }
}

export default CGUI;