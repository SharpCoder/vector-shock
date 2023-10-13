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
    const buttons = def.target_ref.map((ref) => findByRef(engine, ref));
    const allHit = buttons.every((button) => button?.beam.hit);

    if (allHit) {
        this.visible = false;
    }
}
