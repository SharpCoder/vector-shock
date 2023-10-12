import { rect2D, Flatten, Repeat, zeros, rads } from 'webgl-engine';
import { Entity, type Surface } from './entity';

export function spawnMirror(
    x: number,
    y: number,
    w: number,
    h: number,
    surfaces: Surface[]
): Entity {
    const mirror = new Entity({
        name: `mirror_${x}_${y}_${w}_${h}`,
        applyPhysics: false,
        collidable: true,
        reflective: true,
        vertexes: rect2D(w, h),
        colors: Flatten(Repeat([255, 0, 0], 6)),
        offsets: [-w / 2, -h / 2, 0],
        position: [x, y, 0],
        rotation: zeros(),
        surfaces,
    });

    return mirror;
}
