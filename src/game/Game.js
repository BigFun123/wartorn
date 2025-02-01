import { FreeCamera, HemisphericLight, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Vector3 } from '@babylonjs/core';
import { Inspector } from '@babylonjs/inspector';
import { log, error } from './debug/Log.js';
import CRender from './Render.js';
import CPhysics from './Physics.js';
import { gplayer, gscene } from './Global.js';
import { Bus, EVT_KEYDOWN, EVT_KEYUP, EVT_LOADMISSION, EVT_MISSIONLOADED, EVT_PAUSE, EVT_RESET, EVT_RESUME, EVT_SELECTMISSION, EVT_SETSTATE } from './Bus.js';
import assetMan from './AssetMan.js';
import SkyBox from './SkyBox.js';
import { setupFollowCamera, setupFreeCamera } from './CameraMan.js';
import missionControl from './MissionControl.js';
import CGUI from './ui/GUI.js';
import CraftStatus from './ui/CraftStatus.js';
import CCursor from './CCursor.js';
import Input from './Input.js';
import CBulletManager from './BulletMan.js';
import Debug from './ui/Debug.js';
import CAudioMan from './CAudioMan.js';
import { initProgress } from './ui/Progress.js';
import stateInstance from './State.js';
import MissionSelector from './ui/MissionSelector.js';
import { CPerformance } from './ui/CPerformance.js';
import VehicleSelector from './ui/VehicleSelector.js';
import LoadingScreen from './ui/LoadingScreen.js';

/**
 * All components have the same lifecycle
 * Setup
 * Loading critical assets
 * Render
 * Streaming aesthetic assets
 */
class Game {
    _render = null;
    _ready = false;
    _physics = null;
    _light = null;
    _engine = null;
    _status = null;
    _cursor = null;
    _bulletman = null;
    _missionSelector = null;

    _setuptasks = ["setupsky", "setupperf"];
    _counter = 0;

    constructor() {

        log("Game constructor");
        if (this._ready) {
            return;
        }

        this._engine = gscene.getEngine();
        this._engine.loadingScreen = new LoadingScreen(gscene);
        new CGUI(this._engine);
        this._status = new CraftStatus();
        this._debug = new Debug();
        this.setup();

        initProgress();
        this._ready = true;
        this._bulletman = new CBulletManager();

        // Unlock audio on first user interaction.
        window.addEventListener('click', () => {
            if (this._engine.audioEngine) {
                if (!this._engine.audioEngine.unlocked) {
                    this._engine.audioEngine.unlock();
                }
            }
        }, { once: true });

        Bus.subscribe(EVT_KEYUP, (key) => {
            if (key.code === "KeyD" && key.shiftKey) {
                console.log(key);
                Inspector.Show(gscene, {});
            }

            if (key.code === "Escape") {
                if (stateInstance.paused) {
                    stateInstance.paused = false;
                    Bus.send(EVT_RESUME, {});
                } else {
                    stateInstance.paused = true;
                    stateInstance.page = "menu";
                    Bus.send(EVT_PAUSE, {});
                }


            }
        });

        Bus.subscribe(EVT_SETSTATE, (state) => {
            if (state.page === "menu") {
                this.pause(true);
            } else {
                this.pause(false);
            }
        });

        Bus.subscribe(EVT_RESET, () => {
            this.reset();
        });

        Bus.subscribe(EVT_LOADMISSION, async (mission) => {

        });

        Bus.subscribe(EVT_MISSIONLOADED, async (mission) => {
            this._cursor.setup();
            setupFollowCamera();
        });
    }

    async setup() {

        this._physics = new CPhysics();        
        this._render = new CRender();
        this._assets = new assetMan(gscene);
        this._cursor = new CCursor();

        this._input = new Input();
        
        this._audio = new CAudioMan();
        this._missionSelector = new MissionSelector();        
        this._vehicleSelector = new VehicleSelector();
        
        setupFreeCamera()
        this._input.setup();
        await this._physics.setup();
        this._missionSelector.setup();
        this._vehicleSelector.setup();
        stateInstance.setup();
        this.pause(false);
    }

    lazysetup() {
        if (this._setuptasks.length === 0) {
            return;
        }
        // take top task
        const task = this._setuptasks.shift();
        if (task === "setupsky") {
            this._skybox = new SkyBox();
        }
        if (task === "setupperf") {
            new CPerformance(gscene);
        }
    }

    dispose() {
        missionControl.dispose();
        gscene.game = null;
    }

    reset() {
        missionControl.reset();
        gplayer.reset();
    }

    pulse(delta) {
        if (stateInstance.paused || !gscene || !this._ready) {
            return;
        }

        missionControl.pulse(delta);
        this._bulletman.pulse(delta);

        this._counter++;
        if (this._counter % 30 === 0) {
            this._counter = 0;
            this.lazysetup();
        }

        this._status.update();

    }

    renderLoop() {
        this.pulse(gscene.deltaTime || 0);
        if (gscene.cameras.length) {
            gscene.render();
        }
    }

    pause(b) {
        stateInstance.paused = b;
        if (b) {
            this._engine.stopRenderLoop();
        } else {
            this._engine.runRenderLoop(() => {
                this.renderLoop();
            });
        }


    }


}

export { Game };