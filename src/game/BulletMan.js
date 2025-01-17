import { Color3, MeshBuilder, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, Quaternion, StandardMaterial, Vector3 } from "@babylonjs/core";
import { Bus, EVT_DEBUG, EVT_PLAY3DAUDIO, EVT_PROGRESS } from "./Bus";
import { gscene } from "./Global";
import { CExplosionManager } from "./CExplosionManager";




export default class CBulletManager {

    static bullets = [];
    static bulletMaterial = null;
    static exploder = null;


    static setupMat() {
        CBulletManager.exploder = new CExplosionManager(2);
        CBulletManager.bulletMaterial = new StandardMaterial("bulletMaterial", gscene);
        CBulletManager.bulletMaterial.diffuseColor = new Color3(1, 0, 0);
        CBulletManager.bulletMaterial.emissiveColor = new Color3(2.2, 0.8, 0.5);
        CBulletManager.bulletMaterial.specularColor = new Color3(1, 0, 0);
        CBulletManager.bulletMaterial.disableLighting = true;
        CBulletManager.bulletMaterial.backFaceCulling = false;
        CBulletManager.bulletMaterial.alpha = 0.9;
    }

    static fireBullet(owner) {
        if (!CBulletManager.bulletMaterial) {
            CBulletManager.setupMat();
        }
        Bus.send("play-audio", { name: this.fire1Sound, volume: 0.1 });

        const bullet = MeshBuilder.CreateBox("bullet", { width: 0.02, height: .02, depth: 0.3 }, gscene);
        bullet.lifespan = 200;
        bullet.material = CBulletManager.bulletMaterial;
        bullet.rotationQuaternion = Quaternion.FromLookDirectionLH(owner.forward, owner.up);
        //bullet.position = owner.getAbsolutePosition().add(owner.forward.scale(-0.75)).add(new Vector3(0, 0, -0.5));
        bullet.position = owner.getAbsolutePosition().add(owner.forward.scale(-0.75));
        
        
        bullet.aggregate = new PhysicsAggregate(bullet, PhysicsShapeType.BOX, { mass: 0.01, friction: 0.15, restitution: 0.2 }, gscene);
        bullet.aggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);
        bullet.aggregate.body.setLinearVelocity(owner.forward.scale(this.bulletSpeed));
        bullet.aggregate.shape.filterMembershipMask = 2;

        // enable collision events on the body
        bullet.aggregate.body.setCollisionCallbackEnabled(true);

        bullet.aggregate.body.disablePreStep = false;
        CBulletManager.bullets.push(bullet);
        // add a collision callback
        bullet.aggregate.body.getCollisionObservable().add((collider) => {
          CBulletManager.bulletCollision(bullet, collider);
        });
    }

    static bulletCollision(bullet, collider) {
        //Bus.send("bullet-collision", { bullet: bullet, mesh: mesh });
        Bus.send(EVT_DEBUG, "bullet hit " + collider.collidedAgainst?.transformNode?.name + ":" +  collider.collidedAgainst.transformNode?.parent?.name);
        Bus.send(EVT_PLAY3DAUDIO, { name: "massive-thump-116359.mp3", mesh: collider.collidedAgainst.transformNode, volume: 0.70 });
        CBulletManager.createBulletImpact(bullet);
        CBulletManager.bullets.splice(this.bullets.indexOf(bullet), 1);
        bullet.dispose();

        // reduce health of collider
        //this.takeHealth(bullet, collider, this.bulletDamage);

    }

    static createBulletImpact(bullet) {
        CBulletManager.exploder.explode(bullet.aggregate.transformNode.position.clone(), Math.random() * 0.5 + 0.5);
    }

    pulse() {
        CBulletManager.bullets.forEach((bullet) => {
            bullet.position.addInPlace(bullet.forward.scale(1.00));
            bullet.lifespan -= 1;
            if (bullet.lifespan <= 0) {
                CBulletManager.bullets.splice(CBulletManager.bullets.indexOf(bullet), 1);
                bullet.dispose();
            }
        });
    }
}