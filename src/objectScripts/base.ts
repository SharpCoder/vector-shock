import type { Engine } from 'webgl-engine';
import type { Entity } from '../objects/entity';

export type ScriptDefinition = {
    name: string;
    args: any[];
};

export type ObjectScript = (
    this: Entity,
    engine: Engine<unknown>,
    args: any[]
) => void;

export function findByRef(
    engine: Engine<unknown>,
    ref: string
): Entity | undefined {
    return engine.activeScene.objects
        .filter((x) => (x as Entity).ref === ref)
        .at(0) as Entity;
}
