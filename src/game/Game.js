import { FreeCamera, HemisphericLight, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Vector3 } from '@babylonjs/core';
import { Inspector } from '@babylonjs/inspector';
import { log, error } from './debug/Log.js';
import State from './State.js';
import CRender from './Render.js';
import CPhysics from './Physics.js';
import { gplayer, gscene } from './Global.js';
import { Bus, EVT_KEYDOWN, EVT_KEYUP, EVT_PAUSE, EVT_RESET, EVT_RESUME, EVT_SETSTATE } from './Bus.js';
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

    _setuptasks = ["setupsky"];
    _counter = 0;

    constructor() {

        log("Game constructor");
        if (this._ready) {
            return;
        }


        this.setup();
        this._engine = gscene.getEngine();
        new CGUI(this._engine);
        this._status = new CraftStatus();
        this._debug = new Debug();
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
    }

    async setup() {

        this._physics = new CPhysics();
        await this._physics.setup();
        this._render = new CRender();
        this._assets = new assetMan(gscene);
        this._cursor = new CCursor();

        this._input = new Input();
        this._input.setup();
        this._audio = new CAudioMan();






        // let temp = MeshBuilder.CreateBox("box", { size: 0.1 }, gscene);
        // temp.position.x = 2.5;
        // temp.position.y = 0.5;


        // temp = MeshBuilder.CreateBox("box", { size: 0.1 }, gscene);
        // temp.position.x = 0;
        // temp.position.y = 2.5;


        // temp = MeshBuilder.CreateBox("box", { size: 0.1 }, gscene);
        // temp.position.x = 0;
        // temp.position.y = 0;
        // temp.position.z = 2.5;

        await missionControl.setupMission();
        this._cursor.setup();

        setupFollowCamera();

        this.pause(false);


        //this._skybox = new SkyBox();
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
        if (State.paused || !gscene || !this._ready) {
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
        State.paused = b;
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