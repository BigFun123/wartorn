import { Quaternion } from "@babylonjs/core";

export class CControlSurfaces {

    // MiG 29
    controlSurfaces = [
        { name: "Tail_Left",    control: "pitch", mult: 0.2, min: -2, max: 2, center: 0 },
        { name: "Tail_Right",   control: "pitch", mult: 0.2, min: -2, max: 2, center: 0 },
        { name: "Rudder_Left",  control: "yaw", mult: 1, min: -2, max: 2, center: 0 },
        { name: "Rudder_Right", control: "yaw", mult: 1, min: -2, max: 2, center: 0 },
        { name: "Aileron_Left", control: "roll", mult: 0.8, min: -2, max: 2, center: 0 },
        { name: "Aileron_Right", control: "roll", mult: -0.8, min: -2, max: 2, center: 0 },
        { name: "Flap_Left", control: "pitch", mult: -0.5, min: -2, max: 2, center: 0 },
        { name: "Flap_Right", control: "pitch", mult: 0.5, min: -2, max: 2, center: 0 },
    ];

    constructor(scene) {

    }

    setup(meshes) {
        this.controlSurfaces.forEach((surface) => {
            // find a mesh named the same as a control surface and assign it to a surface definition
            surface.mesh = meshes.find((mesh) => {
                return mesh.name === surface.name;
            });
            surface.mesh && (surface.rotationQuaternion = surface.mesh.rotationQuaternion.clone());
            //surface.mesh.rotationQuaternion = Quaternion.FromEulerAngles(0, 0, 0);
        });
    }

    // controller inputs range -1 to +1
    setControlSurfaces(yaw, pitch, roll) {
        this.controlSurfaces.forEach((surface) => {
            // yaw
            if (surface.control == "yaw") {
                this.setMeshRotation(surface.rotationQuaternion, surface.mesh, 0, yaw * surface.mult, 0);
            }
            if (surface.control == "pitch") {
                this.setMeshRotation(surface.rotationQuaternion, surface.mesh, 0, 0, pitch * surface.mult);
            }
            if (surface.control == "roll") {
                this.setMeshRotation(surface.rotationQuaternion, surface.mesh, roll * surface.mult, 0, 0);
            }
        });
    }

    setMeshRotation(initial, mesh, x, y, z) {
        mesh && (mesh.rotationQuaternion = initial.multiply(Quaternion.FromEulerAngles(x, y, z)));
    }

}

export default CControlSurfaces;