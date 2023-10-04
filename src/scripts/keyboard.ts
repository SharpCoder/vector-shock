import type { Engine } from 'webgl-engine';
import type { Entity } from '../objects/entity';
import { MAX_VEL_Y } from './physics';

const VEL = 100;
export function processJump(sprite: Entity, engine: Engine<unknown>) {
    if (engine.keymap['d']) {
        sprite.physics.targetVx = VEL;
    } else if (engine.keymap['a']) {
        sprite.physics.targetVx = -VEL;
    }

    if (engine.keymap[' '] === true && sprite.physics.vy === 0) {
        sprite.physics.vy = MAX_VEL_Y / 3;
    }
}
