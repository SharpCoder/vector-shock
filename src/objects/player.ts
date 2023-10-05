import { rect2D, Flatten, Repeat, zeros, rads } from 'webgl-engine';
import { Entity } from './entity';
import { processJump } from '../scripts/keyboard';

export function spawnPlayer(): Entity {
    const w = 30;
    const h = 30;

    const player = new Entity({
        name: 'player',
        applyPhysics: true,
        collidable: false,
        vertexes: rect2D(w, h),
        colors: Flatten([Repeat([255, 0, 255], 3), Repeat([0, 255, 255], 3)]),
        offsets: [-w / 2, -h / 2, 0],
        position: [350, 150, 0],
        rotation: zeros(),
        update: function (time, engine) {
            processJump(player, engine);
        },
    });

    return player;
}
