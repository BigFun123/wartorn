import { AssetsManager } from "@babylonjs/core";
import { Bus, EVT_MISSIONLOADED, EVT_PLAYERCREATED, EVT_PROGRESS, EVT_WORLDLOADED } from "./Bus";

class AssetMan {
    _assetman = null;
    _textureman = null;
    _playerman = null;
    static _instance
    constructor(scene) {
        AssetMan._instance = this;
        this._assetman = new AssetsManager(scene);
        this._textureman = new AssetsManager(scene);
        this._playerman = new AssetsManager(scene);

        this._textureman.onProgress = (remainingCount, totalCount, task) => {
            Bus.send(EVT_PROGRESS, { text: "Texture", progress: 100 - (remainingCount / totalCount) * 100 });
        }

        this._playerman.onProgress = (remainingCount, totalCount, task) => {
            Bus.send(EVT_PROGRESS, { text: "Player", progress: 100 - (remainingCount / totalCount) * 100 });
        }

        this._assetman.onProgress = (remainingCount, totalCount, task) => {
            Bus.send(EVT_PROGRESS, { text: "Loading", progress: 100 - (remainingCount / totalCount) * 100 });
        };
        this._assetman.onFinish = (tasks) => {
            //Bus.send(EVT_PLAYERCREATED, {});
            Bus.send(EVT_WORLDLOADED, {});
            Bus.send(EVT_MISSIONLOADED, {});
            
        };
    }

    static start() {
        AssetMan.getInstance()._assetman.load();
    }

    static startTextures() {
        AssetMan.getInstance()._textureman.load();
    }

    static startPlayer() {
        AssetMan.getInstance()._playerman.load();
    }

    static getInstance() {
        return AssetMan._instance;
    }

    static getPlayerMan() {
        return AssetMan.getInstance()._playerman;
    }
}

export default AssetMan;