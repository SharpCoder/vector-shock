import type { Engine } from 'webgl-engine';
import type { Entity } from '../objects/entity';
import { findByRef, type MoveWhenHitScript } from '../scripts/objectScripts';

export function moveWhenHit(
    this: Entity,
    engine: Engine<unknown>,
    def: MoveWhenHitScript
) {
    let { activated, counter, v } = this.properties;

    // Find the ref
    const button = findByRef(engine, def.target_ref);

    if (button && button.beam.hit) {
        this.properties['activated'] = true;
        this.properties['counter'] = counter ?? 0;
        this.properties['v'] = v ?? 1;
    }

    if (activated) {
        counter += v;
        if (counter === def.dist || counter === 0) {
            v *= -1;
        }

        const t = Math.sin((counter / def.dist) * 2 * Math.PI);

        this.physics.vx -= (t / 10) * def.move_vec[0];
        this.physics.vy -= (t / 10) * def.move_vec[1];

        this.properties['counter'] = counter;
        this.properties['v'] = v;
    }
}
