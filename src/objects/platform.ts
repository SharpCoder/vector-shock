import { rect2D, Flatten, Repeat, zeros, rads } from 'webgl-engine';
import { Entity } from './entity';
import { processJump } from '../scripts/keyboard';

export function spawnPlatform(
    x: number,
    y: number,
    w: number,
    h: number
): Entity {
    const platform = new Entity({
        name: `platform_${x}_${y}_${w}_${h}`,
        applyPhysics: false,
        collidable: true,
        reflective: true,
        computeBbox: true,
        vertexes: rect2D(w, h),
        colors: Flatten([Repeat([204, 255, 0], 6)]),
        offsets: [-w / 2, -h / 2, 0],
        position: [x, y, 0],
        rotation: zeros(),
        update: function (time, engine) {
            if (this.beam.hit) {
                this.colors = Flatten(Repeat([255, 0, 255], 6));
            } else {
                this.colors = Flatten(Repeat([204, 255, 0], 6));
            }

            engine.activeScene.updateObject(this);
        },
    });

    return platform;
}
