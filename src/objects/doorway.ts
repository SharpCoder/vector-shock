import { Flatten, Repeat, rect2D, zeros } from 'webgl-engine';
import { Entity } from './entity';

export function spawnDoorway(ref: string, x: number, y: number): Entity {
    const w = 10;
    const h = 300;

    const doorway = new Entity({
        name: `ray_doorway_${x}_${y}_${w}_${h}`,
        ref,
        applyPhysics: false,
        collidable: true,
        reflective: false,
        vertexes: rect2D(w, h),
        colors: Flatten(Repeat([255, 0, 0], 6)),
        offsets: [-w / 2, 0, 0],
        position: [x, y, 0],
        rotation: zeros(),
    });

    return doorway;
}
