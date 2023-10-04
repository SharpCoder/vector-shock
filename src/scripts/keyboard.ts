import type { Engine } from 'webgl-engine';
import type { Entity } from '../objects/entity';

const VEL = 4;
export function processJump(sprite: Entity, engine: Engine<unknown>) {
    if (engine.keymap['d']) {
        sprite.physics.vx = VEL;
    } else if (engine.keymap['a']) {
        sprite.physics.vx = -VEL;
    }

    if (engine.keymap[' '] === true && sprite.physics.vy === 0) {
        sprite.physics.vy = 20;
    }
}
