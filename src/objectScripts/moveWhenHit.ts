import type { Engine } from 'webgl-engine';
import type { Entity } from '../objects/entity';
import { findByRef } from './base';

export function moveWhenHit(
    this: Entity,
    engine: Engine<unknown>,
    args: any[]
) {
    let { activated, counter, v } = this.properties;
    const [ref, dist, vec] = args;

    // Find the ref
    const button = findByRef(engine, ref);

    if (button && button.beam.hit) {
        this.properties['activated'] = true;
        this.properties['counter'] = counter ?? 0;
        this.properties['v'] = v ?? 1;
    }

    if (activated) {
        counter += v;
        if (counter === 100 || counter === 0) {
            v *= -1;
        }

        const t = Math.sin((counter / 100.0) * 2 * Math.PI);

        this.physics.vx -= (t / 10) * vec[0];
        this.physics.vy -= (t / 10) * vec[1];

        this.properties['counter'] = counter;
        this.properties['v'] = v;
    }
}
