import type { Drawable, Engine, bbox, texture } from 'webgl-engine';

interface WorldDrawable extends Drawable {
    applyPhysics: boolean;
}

export class Entity implements WorldDrawable {
    applyPhysics: boolean;
    physics = {
        enabled: true,
        vx: 0,
        vy: 0,
        acceleration: 1,
    };

    name: string;
    position: number[];
    rotation: number[];
    offsets: number[];
    vertexes: number[];
    computeBbox?: boolean;
    children: Drawable[];
    texcoords?: number[];
    texture?: texture;
    colors?: number[];
    visible?: boolean;
    scale?: [number, number, number];
    additionalMatrix?: number[];
    _bbox?: bbox;
    _computed?: {
        positionMatrix: number[];
    };
    update?: (time_t: number, engine: Engine<unknown>) => void;
    beforeDraw?: (engine: Engine<unknown>) => void;

    constructor({
        applyPhysics,
        name,
        position,
        rotation,
        offsets,
        vertexes,
        children,
        texcoords,
        texture,
        colors,
        visible,
        scale,
        additionalMatrix,
        update,
        beforeDraw,
    }: WorldDrawable) {
        this.applyPhysics = applyPhysics;
        this.name = name;
        this.position = position;
        this.rotation = rotation;
        this.offsets = offsets;
        this.vertexes = vertexes;
        this.computeBbox = applyPhysics;
        this.children = children ?? [];
        this.texcoords = texcoords;
        this.texture = texture;
        this.colors = colors;
        this.visible = visible;
        this.scale = scale;
        this.additionalMatrix = additionalMatrix;
        this.update = update;
        this.beforeDraw = beforeDraw;
    }
}
