import Aircraft from "./Aircraft";
import AssetMan from "./AssetMan";
import { Bus, EVT_DEBUG_NEXTTARGET, EVT_ERROR, EVT_LOADMISSION, EVT_LOADVEHICLE, EVT_MISSIONSELECTED, EVT_NEXTTARGET_SELECTED, EVT_PAUSE, EVT_RESUME, EVT_SELECTDMISSION, EVT_SELECTMISSION, EVT_SELECTNEXTTARGET, EVT_SETCAMERATARGET, EVT_SETSTATE, EVT_VEHICLELOADED, EVT_VEHICLEPREPARED, EVT_VEHICLESELECTED, EVT_WORLDLOADED } from "./Bus";
import { CTerrain } from "./CTerrain";
import Cube from "./Cube";
import GameObject from "./GameObject";
import Ground from "./Ground";
import NPC from "./NPC";
import Player from "./Player";
import stateInstance from "./State";
import StaticMesh from "./StaticMesh";
import Tank from "./Tank";
import CDrone from "./vehicles/CDrone";
import Water from "./Water";

class MissionControl {

    _objects = [];
    _enemies = [];
    _allies = [];
    _spawns = [];
    _player = null;
    _targetIndex = 0;
    _debugtargetIndex = 0;
    _running = false;
    _playerVehicle = null;
    _mission = null;
    _debugObject = null;

    constructor() {
        this.mission = null;

        Bus.subscribe(EVT_WORLDLOADED, () => {
            this.startMission();
            this.loadHDTextures();
        });

        Bus.subscribe(EVT_PAUSE, () => {
            this.endMission();
        });

        Bus.subscribe(EVT_RESUME, () => {
            this.startMission();
        });

        Bus.subscribe(EVT_SELECTNEXTTARGET, () => {
            this._targetIndex++;
            if (this._targetIndex >= this._objects.length) {
                this._targetIndex = 0;
            }

            if (this._player) {
                this._player.selectNextTarget(this._objects[this._targetIndex]);
            }
            Bus.send(EVT_NEXTTARGET_SELECTED, this._objects[this._targetIndex]);
        });

        Bus.subscribe(EVT_MISSIONSELECTED, async (mission) => {
            await this.loadMission(mission);
        });

        Bus.subscribe(EVT_LOADMISSION, async () => {
            await this.setupMission(this._mission);
        });

        Bus.subscribe(EVT_VEHICLESELECTED, async (vehicle) => {
            this._playerVehicle = vehicle;            
            Bus.send(EVT_VEHICLEPREPARED, {});
            //await this.setupVehicle(vehicle);
            //Bus.send(EVT_VEHICLELOADED, vehicle);
        });

        Bus.subscribe(EVT_DEBUG_NEXTTARGET, () => {
            this._debugtargetIndex++;
            if (this._debugtargetIndex >= this._objects.length) {
                this._debugtargetIndex = 0;
            }
            const obj = this._objects[this._debugtargetIndex];
            if (obj._mesh) {
                Bus.send(EVT_SETCAMERATARGET, this._objects[this._debugtargetIndex]._mesh);
            }
            
        });


        //this.loadMissionIndex();
    }

    async loadMissionIndex() {
        await fetch("/assets/missions/index.json")
            .then((response) => response.json())
            .then((data) => {
                this.missions = data;
                console.log(data);
            })
            .catch((error) => {
                Bus.send(EVT_ERROR, "Failed to load mission index");
            });
    }

    async loadMission(mission) {
        return fetch(`/assets/missions/${mission.file}`)
            .then((response) => response.json())
            .then((data) => {
                this._mission = data;
            })
            .catch((error) => {
                Bus.send(EVT_ERROR, "Failed to load mission");
                console.log(error);
            });
    }

    dispose() {
        if (this._objects) {
            for (let i = 0; i < this._objects.length; i++) {
                this._objects[i] && this._objects[i].dispose();
                this._objects[i] = null;
            }
            this._objects = [];
        }
    }

    reset() {
        //tell all objects to reset to their initial position
        for (let i = 0; i < this._objects.length; i++) {
            this._objects[i].reset();
        }
    }

    pulse(delta) {
        if (!this._running) {
            return;
        }

        for (let i = 0; i < this._objects.length; i++) {
            this._objects[i].pulse(delta);
        }

        for (let i = 0; i < this._enemies.length; i++) {
            this._enemies[i].pulse(delta);
        }

        for (let i = 0; i < this._allies.length; i++) {
            this._allies[i].pulse(delta);
        }

        if (this._player) {
            this._player.pulse(delta);
        }

    }

    async setupVehicle(vehicle) {
        const go = vehicle;
        let ac = null;

        const spawn = this.findSpawn(go);
        if (spawn) {
            go.position = [spawn.position[0], spawn.position[1], spawn.position[2]];
            go.rotation = [spawn.rotation[0], spawn.rotation[1], spawn.rotation[2], spawn.rotation[3]];
        }

        if (go.type === "aircraft") {
            ac = new Aircraft(go);
        }

        if (go.type === "ground") {
            ac = new Tank(go);
        }

        this._player = new Player("player1", ac);

        this._objects.push(ac);
    }

    /**
     * TODO: find a spawn per team
     * @returns 
     */
    findSpawn(go) {
        for (let i=0; i< this._spawns.length; i++) {
            const spawn = this._spawns[i];
            if (spawn.craft == go.type) {
                return spawn;
            }
        }
        return this._spawns[0];
    }

    /**
     * Iterate through the .json mission file and prepare each object for spawning
     * @param {*} mission 
     */
    async setupMission(mission) {

        // get available spawns from mission
        for (let i = 0; i < this._mission.length; i++) {
            const go = this._mission[i];
            if (go.type === "spawn") {
                this._spawns.push(go);
            }
        }

        this.setupVehicle(this._playerVehicle);

        for (let i = 0; i < this._mission.length; i++) {
            const go = this._mission[i];
            let gobj = null;

            if (go.type === "ground") {
                const ground = new Ground(go);
                this._objects.push(ground);
                gobj = ground;
            }
            if (go.type === "cube") {
                const cube = new Cube(go);
                this._objects.push(cube);
                gobj = cube;
            }
            if (go.type === "water") {
                const water = new Water(go);
                this._objects.push(water);
                gobj = water;
            }
            if (go.type === "aircraft") {
                const ac = new Aircraft(go);
                this._objects.push(ac);
                gobj = ac;
            }

            if (go.type === "drone") {
                const drone = new CDrone(go);
                this._objects.push(drone);
                gobj = drone;
            }

            if (go.type === "tank") {
                const ac = new Tank(go);
                this._objects.push(ac);
                gobj = ac;
            }

            if (go.type === "staticmesh") {
                const sm = new StaticMesh(go);
                this._objects.push(sm);
                gobj = sm;
            }

            if (go.type === "tiledterrain") {
                const sm = new CTerrain(+go.x, +go.y, +go.num);
                this._objects.push(sm);
                gobj = sm;
            }

            if (go.type === "music") {
                Bus.send("play-music", { name: go.file });
            }
            if (go.type === "ambient") {
                Bus.send("play-ambient", { name: go.file });
            }

            if (go.isNPC && gobj) {
                const npc = new NPC(gobj, go);
                this._enemies.push(npc);
            }

            // if (go.isplayer && gobj) {
            //     this._player = new Player("player1", gobj);
            // }
        }

        if (!this._player) {
            console.error("no player mesh found");
        }

        // now setup all the objects properly, starting any streaming tasks
        for (let i = 0; i < this._objects.length; i++) {
            if (this._objects[i].setup) {
                this._objects[i].setup();
            }
        }

        AssetMan.start();


    }

    loadHDTextures() {
        for (let i = 0; i < this._objects.length; i++) {
            if (this._objects[i].loadHDTextures) {
                this._objects[i].loadHDTextures();
            }
        }
        AssetMan.startTextures();
    }

    startMission() {
        this._running = true;
    }

    endMission() {
        this._running = false;
    }
}

const missionControl = new MissionControl();
export default missionControl;