import type { Engine } from 'webgl-engine';
import type { Entity } from '../objects/entity';

export function shiftVisible(
    this: Entity,
    time: number,
    engine: Engine<unknown>
) {
    this.visible = engine.keymap?.['shift'] === true;
}
