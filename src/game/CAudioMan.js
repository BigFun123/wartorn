import { Sound } from "@babylonjs/core";
import { Bus, EVT_PLAY3DAUDIO, EVT_SETVOLUME } from "./Bus.js";
import { gscene, playAudio } from "./Global.js";

export default class CAudioMan {
    
    path = "/assets/audio/";
    sounds = [];
    music = [];
    ambient = [];
    spatial = [];

    settings = {
        soundVolume: 0.5,
        musicVolume: 0.15,
        ambientVolume: 0.15
    }

    constructor() {
        this.scene = gscene;
        //this.play("jet-loop-01-32474.mp3");
        if (playAudio) {
            Bus.subscribe("play-music", (data) => {
                this.playMusic(data.name);
            });
            Bus.subscribe("play-audio", (data) => {
                this.playOnce(data.name, data.volume);
            });
            Bus.subscribe("play-ambient", (data) => {
                this.playAmbient(data.name, data.fadein);
            });
            Bus.subscribe("stop-ambient", (data) => {
                this.stopAmbient(data.name);
            });
            Bus.subscribe(EVT_PLAY3DAUDIO, (data) => {
                this.play3d(data.name, data.mesh, data.volume, data.loop);
            });
            Bus.subscribe(EVT_SETVOLUME, (data) => {
                this.updateVolume(data);
            });
        }
    }

    preload() {

    }

    cull() {
        if (this.sounds.length > 3) {
            // remove the first one
            //this.sounds[0].dispose();
            this.sounds[0].stop();
            this.sounds.shift();
        }

    }

    stopAmbient(name) {
        for (let key of this.ambient) {
            key.stop();
        }
    }

    updateVolume(data) {
        for (let key of this.ambient) {
            if (key.name == data.name) {
                key.setVolume(data.volume);
            }
        }
    }

    playAmbient(name, fadein) {

        // stop all ambients
        let found = false;
        let sound;
        for (let key of this.ambient) {
            if (key.name != name) {
                key.stop();
            }
            else {
                key.play();
                sound = key;
                found = true;
            }
        }

        if (!found) {
            sound = new Sound(name, this.path + name, this.scene, (dat) => {

            }, { loop: true, autoplay: true });
            this.ambient.push(sound);
        }

        if (fadein) {
            this.fadeIn(sound, 0, this.settings.ambientVolume);
        } else {
            sound.setVolume(this.settings.ambientVolume);
        }


    }

    fadeIn(sound, min, max) {
        sound.setVolume(min);
        sound.setVolume(max, 2);
    }

    playMusic(name) {
        this.cull();
        // Load the sound and play it automatically once ready
        var sound = new Sound(name, this.path + name, this.scene, null, { loop: true, autoplay: true });
        sound.setVolume(this.settings.musicVolume);
        this.music.push(sound);
    }

    findSound(name, array) {
        for (let key of array) {
            if (key.name == name) {
                return key;
            }
        }
    }

    playOnce(name, volume) {
        this.cull();
        // Load the sound and play it automatically once ready
        let sound = this.findSound(name, this.sounds);
        if (!sound) {
            sound = new Sound(name, this.path + name, this.scene, null, { loop: false, autoplay: true });
            this.sounds.push(sound);
        }
        sound.setVolume(volume || this.settings.soundVolume);
        sound.play();

    }
 
    play3d(name, mesh, volume, loop = false) {
        // this.cull();
        // Load the sound and play it automatically once ready
        let sound = this.findSound(name, this.spatial);
        if (!sound) {
            sound = new Sound(name, this.path + name, gscene, null, { loop: loop, autoplay: false, spatialSound: true, maxDistance: 3000 });
            this.spatial.push(sound);

            //sound.onEndedObservable.add(() => {
            //  sound.dispose();
            //});
        }
        sound.setVolume(volume || this.settings.soundVolume);
        sound.attachToMesh(mesh);
        sound.play();

    }
}