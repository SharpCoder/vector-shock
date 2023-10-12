import { rect2D, Flatten, Repeat, zeros, rads } from 'webgl-engine';
import { Entity } from './entity';
import { processJump } from '../scripts/keyboard';

export function spawnShielded(
    x: number,
    y: number,
    w: number,
    h: number
): Entity {
    const shielded = new Entity({
        name: `ray_shielded_${x}_${y}_${w}_${h}`,
        applyPhysics: false,
        collidable: true,
        reflective: false,
        vertexes: rect2D(w, h),
        colors: Flatten(Repeat([255, 0, 0], 6)),
        offsets: [-w / 2, -h / 2, 0],
        position: [x, y, 0],
        rotation: zeros(),
    });

    return shielded;
}
