import { AdvancedDynamicTexture, Container, Control, Image, Rectangle, TextBlock } from "@babylonjs/gui";

export default class LoadingScreen {

    advancedTexture;

    constructor(scene) {
        if (!this.advancedTexture) {
            this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        }
        this._scene = scene;

        this._container = new Container();
        this._container.zIndex = 999;

        this._background = new Rectangle();
        this._background.width = 1;
        this._background.height = 1;
        this._background.background = "black";

        this._text = new TextBlock(null, "Loading");
        this._text.color = "white";
        this._text.fontSize = "28px";
        this._text.height = 0.25;
        this._text.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

        this._image = new Image(null, "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Swirl.png/480px-Swirl.png");
        this._image.width = this._image.height = "25%";

        this.advancedTexture.addControl(this._container);
        this._container.addControl(this._background);
        this._container.addControl(this._text);
        this._container.addControl(this._image);

        this.alpha = 0;

        var _this = this;
        this._loadingAnimation = function () {
            _this.alpha++;

            if (_this.alpha % 61 === 0) {
                _this.alpha = 1;
                _this._text.text = "Loading";
            }
            else if (_this.alpha % 15 === 0) {
                _this._text.text += "."
            }

            _this._image.rotation += 0.05;
        };
    }

    displayLoadingUI = function () {
        var _this = this;
        if (_this._scene) {
            _this._scene.registerBeforeRender(_this._loadingAnimation);
        }
        _this._container.isVisible = true;

    };

    hideLoadingUI = function () {
        var _this = this;
        if (_this._scene) {
            _this._scene.unregisterBeforeRender(_this._loadingAnimation);
        }
        _this._container.isVisible = false;
    };

}