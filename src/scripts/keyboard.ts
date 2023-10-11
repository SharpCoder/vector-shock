import type { Engine } from 'webgl-engine';
import type { Entity } from '../objects/entity';
import { IMPULSE_VEL_X, IMPULSE_VEL_Y, MAX_VEL_X } from './physics';

export function processJump(sprite: Entity, engine: Engine<unknown>) {
    if (engine.keymap['d']) {
        sprite.physics.vx = IMPULSE_VEL_X;
    } else if (engine.keymap['a']) {
        sprite.physics.vx = -IMPULSE_VEL_X;
    }

    if (engine.keymap[' '] === true && sprite.physics.vy === 0) {
        sprite.physics.vy = IMPULSE_VEL_Y;
    }
}
