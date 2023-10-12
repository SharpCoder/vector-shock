import { rect2D, Flatten, Repeat, zeros, rads } from 'webgl-engine';
import { Entity } from './entity';
import { processJump } from '../scripts/keyboard';
import type { ScriptDefinition } from '../objectScripts/base';

export function spawnPlatform(
    ref: string,
    x: number,
    y: number,
    w: number,
    h: number,
    scripts?: ScriptDefinition[]
): Entity {
    const platform = new Entity({
        name: `platform_${x}_${y}_${w}_${h}`,
        ref,
        applyPhysics: false,
        collidable: true,
        reflective: false,
        vertexes: rect2D(w, h),
        colors: Flatten(Repeat([0, 0, 0], 6)),
        offsets: [-w / 2, -h / 2, 0],
        position: [x, y, 0],
        rotation: zeros(),
        scripts,
        properties: {
            activated: undefined,
        },
        surfaces: ['north', 'south', 'center_horizontal'],
        update: function (time, engine) {
            if (this.beam.hit) {
                this.colors = Flatten(Repeat([255, 255, 255], 6));
            } else {
                this.colors = Flatten(Repeat([255, 0, 255], 6));
            }

            engine.activeScene.updateObject(this);
        },
    });

    return platform;
}
