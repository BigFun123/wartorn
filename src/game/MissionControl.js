import Aircraft from "./Aircraft";
import AssetMan from "./AssetMan";
import { Bus, EVT_ERROR, EVT_PAUSE, EVT_RESUME, EVT_WORLDLOADED } from "./Bus";
import GameObject from "./GameObject";
import Ground from "./Ground";
import NPC from "./NPC";
import Player from "./Player";
import StaticMesh from "./StaticMesh";
import Tank from "./Tank";
import Water from "./Water";

class MissionControl {

    _objects = [];
    _enemies = [];
    _allies = [];
    _player = null;
    _running = false;

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


        this.loadMissionIndex();
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

    async loadMission(name) {
        return fetch(`/assets/missions/${name}.json`)
            .then((response) => response.json())
            .then((data) => {
                this._mission = data;
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

    async setupMission() {
        await this.loadMission("test2");

        for (let i = 0; i < this._mission.length; i++) {
            const go = this._mission[i];
            let gobj = null;

            if (go.type === "ground") {
                const ground = new Ground(go);
                this._objects.push(ground);
                gobj = ground;
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

            if (go.type === "music") {
                Bus.send("play-music", { name: go.file });
            }
            if (go.type === "ambient") {
                Bus.send("play-ambient", { name: go.file });
            }

            if (go.isNPC && gobj) {
                const npc = new NPC(gobj, go.name, go.health, go.damage, go.armor);
                this._enemies.push(npc);
            }

            if (go.isplayer && gobj) {
                this._player = new Player("player1", gobj);
            }
        }

        if (!this._player) {
            console.error("no player mesh found");
        }

        // now setup all the objects properly, starting any streaming tasks
        for (let i = 0; i < this._objects.length; i++) {
            this._objects[i].setup();
        }

        AssetMan.start();

       
    }

    loadHDTextures() {
        for (let i = 0; i < this._objects.length; i++) {
            this._objects[i].loadHDTextures();
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