import {
    m3,
    type Drawable,
    type Engine,
    type bbox,
    type texture,
} from 'webgl-engine';

interface WorldDrawable extends Drawable {
    applyPhysics: boolean;
    collidable: boolean;
}

export class Entity implements WorldDrawable {
    applyPhysics: boolean;
    collidable: boolean;
    physics = {
        vx: 0,
        vy: 0,
        targetVx: 0,
        accelerationY: 1,
        movementDuration: 0,
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
    zIndex?: number;
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
        zIndex,
        update,
        beforeDraw,
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
        this.scale = scale;
        this.additionalMatrix = additionalMatrix;
        this.zIndex = zIndex ?? 0;
        this.update = update;
        this.beforeDraw = beforeDraw;
    }

    getBbox(): bbox {
        if (!this._bbox) {
            return {
                x: 0,
                y: 0,
                z: 0,
                w: 0,
                h: 0,
                d: 0,
            };
        } else {
            const bbox = this._bbox;
            // The 3D coordinate plane has some attributes reversed.
            return {
                x: bbox.x,
                y: bbox.y,
                z: 0,
                w: bbox.h,
                h: bbox.w,
                d: 0,
            };
        }
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
        ]);
    }
}
