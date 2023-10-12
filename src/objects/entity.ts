import {
    m3,
    type Drawable,
    type Engine,
    type bbox,
    type texture,
} from 'webgl-engine';
import { makeLine, type Line, type Rect } from '../algebra';
import { moveWhenHit } from '../objectScripts/moveWhenHit';
import {
    applyObjectScripts,
    type ScriptDefinition,
} from '../scripts/objectScripts';

export type Surface =
    | 'north'
    | 'east'
    | 'south'
    | 'west'
    | 'center_vertical'
    | 'center_horizontal';

interface WorldDrawable extends Drawable {
    applyPhysics: boolean;
    collidable: boolean;
    surfaces?: Surface[];
    ref?: string;
    scripts?: ScriptDefinition[];
}

export class Entity implements WorldDrawable {
    applyPhysics: boolean;
    collidable: boolean;
    physics = {
        vx: 0,
        vy: 0,
    };
    beam = {
        hit: false,
    };

    name: string;
    ref?: string;
    position: number[];
    rotation: number[];
    offsets: number[];
    vertexes: number[];
    reflective?: boolean;
    computeBbox?: boolean;
    children: Drawable[];
    texcoords?: number[];
    surfaces: Surface[];
    texture?: texture;
    colors?: number[];
    hidden?: boolean;
    visible?: boolean;
    scale?: [number, number, number];
    preMatrix?: number[];
    additionalMatrix?: number[];
    zIndex?: number;
    properties: Record<any, any>;
    scripts: ScriptDefinition[];
    _parent?: Entity;
    _bbox?: bbox;
    _computed?: {
        positionMatrix: number[];
    };
    update?: (time_t: number, engine: Engine<unknown>) => void;
    beforeDraw?: (engine: Engine<unknown>) => void;

    constructor({
        applyPhysics,
        collidable,
        computeBbox,
        name,
        ref,
        visible,
        hidden,
        position,
        rotation,
        offsets,
        vertexes,
        children,
        texcoords,
        texture,
        colors,
        scale,
        preMatrix,
        additionalMatrix,
        zIndex,
        properties,
        reflective,
        update,
        beforeDraw,
        surfaces,
        scripts,
    }: WorldDrawable) {
        this.applyPhysics = applyPhysics;
        this.collidable = collidable;
        this.name = name;
        this.position = position;
        this.rotation = rotation;
        this.offsets = offsets;
        this.vertexes = vertexes;
        this.computeBbox = computeBbox || applyPhysics || collidable;
        this.children = children ?? [];
        this.texcoords = texcoords;
        this.texture = texture;
        this.colors = colors;
        this.visible = visible;
        this.hidden = hidden ?? false;
        this.scale = scale;
        this.preMatrix = preMatrix;
        this.additionalMatrix = additionalMatrix;
        this.zIndex = zIndex ?? 0;
        this.reflective = reflective ?? false;
        this.properties = properties ?? {};
        this.beforeDraw = beforeDraw;
        this.surfaces = surfaces ?? ['north', 'south', 'east', 'west'];
        this.ref = ref;
        this.scripts = scripts ?? [];
        this.update = (time, engine) => {
            this.beforeUpdate(time, engine);
            update && update.call(this, time, engine);
        };
    }

    beforeUpdate(time: number, engine: Engine<unknown>) {
        applyObjectScripts.call(this, engine, this.scripts);
    }

    getBbox(): Rect {
        if (!this._bbox) {
            return {
                x: 0,
                y: 0,
                w: 0,
                h: 0,
            };
        } else {
            const bbox = this._bbox;
            // The 3D coordinate plane has some attributes reversed.
            return {
                x: bbox.x,
                y: bbox.y - bbox.w,
                w: -bbox.h,
                h: bbox.w,
            };
        }
    }

    getLines(): Line[] {
        const bbox = this.getBbox();
        const lines = [];

        if (this.surfaces.includes('north')) {
            // Top line (North)
            lines.push(makeLine(bbox.x, bbox.y, bbox.x + bbox.w, bbox.y));
        }

        if (this.surfaces.includes('east')) {
            // Right line (East)
            lines.push(
                makeLine(
                    bbox.x + bbox.w,
                    bbox.y + bbox.h,
                    bbox.x + bbox.w,
                    bbox.y
                )
            );
        }

        if (this.surfaces.includes('south')) {
            // Horizontal line in the bottom (South)
            lines.push(
                makeLine(
                    bbox.x + bbox.w,
                    bbox.y + bbox.h,
                    bbox.x,
                    bbox.y + bbox.h
                )
            );
        }

        if (this.surfaces.includes('west')) {
            // Left line (West)
            lines.push(
                makeLine(bbox.x, bbox.y - 1, bbox.x, bbox.y + bbox.h + 1)
            );
        }

        if (this.surfaces.includes('center_horizontal')) {
            // Left line (West)
            lines.push(
                makeLine(
                    bbox.x,
                    bbox.y + bbox.h / 2,
                    bbox.x + bbox.w,
                    bbox.y + bbox.h / 2
                )
            );
        }

        if (this.surfaces.includes('center_vertical')) {
            // Left line (West)
            lines.push(
                makeLine(
                    bbox.x + bbox.w / 2,
                    bbox.y + bbox.h,
                    bbox.x + bbox.w / 2,
                    bbox.y
                )
            );
        }

        return lines;
    }

    getMatrix(): number[] {
        const parentMatrix: number[] = this._parent
            ? this._parent.getMatrix()
            : m3.identity();

        return m3.combine([
            parentMatrix,
            m3.translate(this.position[0], -this.position[1]),
            m3.rotate(this.rotation[0]),
            m3.scale(this.scale?.[0] ?? 1, this.scale?.[1] ?? 1),
            m3.translate(this.offsets[0], this.offsets[1]),
            this.additionalMatrix ?? m3.identity(),
        ]);
    }

    attachScript(script: ScriptDefinition) {
        this.scripts.push(script);
    }

    attachScripts(scripts: ScriptDefinition[]) {
        for (const script of scripts) {
            this.attachScript(script);
        }
    }
}
