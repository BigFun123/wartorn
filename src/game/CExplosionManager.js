import { Constants, Sprite, SpriteManager, Vector3 } from "@babylonjs/core";
import { gscene } from "./Global";

export class CExplosionManager {
    spriteManager;p
    explosions = [];
    currentIndex = 0;    
    constructor() {
        this.spriteManager = new SpriteManager("explosion", "/assets/fx/explosion.png", 100, 200, gscene);
        this.spriteManager.renderingGroupId = 1;  

        this.spriteManager.blendMode = Constants.ALPHA_ADD  ;  
        this.createExplosions();
    }

    createExplosions() {
        for (let i = 0; i < 3; i++) {
            const explosion = (new Sprite("explosion", this.spriteManager));
            explosion.size = 4;
            explosion.isVisible = false;
            this.explosions.push(explosion);
        }
    }

    explode(location, size) {
        const explosion = this.explosions[this.currentIndex++ % this.explosions.length];
        explosion.size = size;
        explosion.position = location.add(new Vector3(0, 0.15, 0));
        explosion.playAnimation(0, 36, false, 25, () => { 
            explosion.isVisible = false;
        });
        explosion.isVisible = true;   

       

    }

    createSmoke() {
        /*const particleSystem = new ParticleSystem("explosion", 2000, this.scene);
        particleSystem.particleTexture = new Texture(CSettings.settings.assetsFolder + "/fx/flare.png", this.scene);
        particleSystem.emitter = this.location;
        particleSystem.minEmitBox = new Vector3(-1, 0, -1);
        particleSystem.maxEmitBox = new Vector3(1, 0, 1);
        particleSystem.color1 = new Color4(1, 0.5, 0, 1);0
        particleSystem.color2 = new Color4(1, 0.5, 0, 1);
        particleSystem.colorDead = new Color4(0, 0, 0, 0);
        particleSystem.minSize = 0.3;
        particleSystem.maxSize = 0.5;
        particleSystem.minLifeTime = 0.3;
        particleSystem.maxLifeTime = 0.5;
        particleSystem.emitRate = 1000;
        particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;
        particleSystem.gravity = new Vector3(0, 0, 0);
        particleSystem.direction1 = new Vector3(-1, 8, 1);
        particleSystem.direction2 = new Vector3(1, 8, -1);
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 3;
        particleSystem.updateSpeed = 0.005;
        particleSystem.start();*/
    }
}