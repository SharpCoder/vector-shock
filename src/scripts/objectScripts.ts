import type { Engine } from 'webgl-engine';
import type { Entity } from '../objects/entity';
import { moveWhenHit } from '../objectScripts/moveWhenHit';
import { disappearWhenHit } from '../objectScripts/disappearWhenHit';

export type DisappearWhenHitScript = {
    type: 'disappearWhenHit';
    target_ref: string;
};

export type MoveWhenHitScript = {
    type: 'moveWhenHit';
    target_ref: string;
    dist: number;
    move_vec: number[];
};

export type OpenWhenHitScript = {
    type: 'openWhenHit';
    target_ref: string;
};

export type ScriptDefinition =
    | MoveWhenHitScript
    | OpenWhenHitScript
    | DisappearWhenHitScript;

export function applyObjectScripts(
    this: Entity,
    engine: Engine<unknown>,
    scripts: ScriptDefinition[]
) {
    for (const script of scripts) {
        switch (script.type) {
            case 'moveWhenHit': {
                moveWhenHit.call(this, engine, script);
                break;
            }
            case 'openWhenHit': {
                break;
            }
            case 'disappearWhenHit': {
                disappearWhenHit.call(this, engine, script);
            }
        }
    }
}

export function findByRef(
    engine: Engine<unknown>,
    ref: string
): Entity | undefined {
    return engine.activeScene.objects
        .filter((x) => (x as Entity).ref === ref)
        .at(0) as Entity;
}
