import type { Engine } from 'webgl-engine';
import type { Entity } from '../objects/entity';
import {
    findByRef,
    type DisappearWhenHitScript,
} from '../scripts/objectScripts';

export function disappearWhenHit(
    this: Entity,
    engine: Engine<unknown>,
    def: DisappearWhenHitScript
) {
    // Find the ref
    const button = findByRef(engine, def.target_ref);

    if (button && button.beam.hit) {
        this.visible = false;
    }
}
