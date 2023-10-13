import { rect2D, Flatten, Repeat, zeros, rads, Engine } from 'webgl-engine';
import { Entity } from './entity';
import { processJump } from '../scripts/keyboard';
import { SCREEN_HEIGHT } from '../constants';

export type SpawnPlayerProps = {
    update?: (time: number, engine: Engine<unknown>) => void;
};

export function spawnPlayer({ update }: SpawnPlayerProps): Entity {
    const w = 30;
    const h = 30;
    const x = 200;
    const y = SCREEN_HEIGHT - h * 5 - 64;

    const player = new Entity({
        name: 'player',
        applyPhysics: true,
        collidable: false,
        vertexes: rect2D(w, h),
        colors: Flatten([Repeat([255, 0, 255], 3), Repeat([0, 255, 255], 3)]),
        offsets: [-w / 2, -h / 2, 0],
        position: [x, y, 0],
        rotation: zeros(),
        update: function (time, engine) {
            processJump(player, engine);
            update && update.call(player, time, engine);
        },
    });

    return player;
}
