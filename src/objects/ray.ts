import { rect2D, Flatten, Repeat, rads } from 'webgl-engine';
import { Entity } from './entity';
import { INFINITY, getScreenScale } from '../constants';

export function spawnRay(theta: number): Entity {
    const thickness = 2;

    // The ray is technically projected until infinity,
    // or if it hits a wall

    const ray = new Entity({
        name: 'ray',
        applyPhysics: false,
        collidable: false,
        computeBbox: true,
        vertexes: rect2D(INFINITY, thickness),
        colors: Flatten([Repeat([255, 0, 255], 6)]),
        offsets: [0, -thickness / 2, 0],
        position: [0, 0, 0],
        rotation: [-theta, 0, 0],
        update: function (time, engine) {
            const { gl } = engine;
            if (!gl) return;
            if (!this._parent) return;

            const [scaleX, scaleY] = getScreenScale(gl);

            // Center the ray on the parent object
            const parent = this._parent as Entity;
            this.position[0] = -(parent.offsets[0] ?? 0);
            this.position[1] = parent.offsets[1] ?? 0;

            // Calculate theta based on mouse
            const mx = engine.mouseOffsetX * scaleX,
                my = engine.mouseOffsetY * scaleY;

            const bbox = parent.getBbox();
            const ox = bbox.x - bbox.w / 2;
            const oy = bbox.y - bbox.h / 2;

            this.rotation[0] = Math.atan2(my - oy, mx - ox);
        },
    });

    return ray;
}
