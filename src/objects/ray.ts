import { rect2D, Flatten, Repeat, rads } from 'webgl-engine';
import { Entity } from './entity';
import { SCREEN_WIDTH } from '../constants';

export function spawnRay(theta: number): Entity {
    const thickness = 2;
    const w = SCREEN_WIDTH / 2;
    const ray = new Entity({
        name: 'ray',
        applyPhysics: false,
        collidable: false,
        vertexes: rect2D(w, thickness),
        colors: Flatten([Repeat([255, 0, 255], 6)]),
        offsets: [0, -thickness / 2, 0],
        position: [0, 0, 0],
        rotation: [-theta, 0, 0],
        update: function (time, engine) {
            // Center the ray on the parent object
            this.position[0] = -(this._parent?.offsets[0] ?? 0);
            this.position[1] = this._parent?.offsets[1] ?? 0;
        },
    });

    return ray;
}
