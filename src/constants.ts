import type { Drawable, Engine, Scene } from 'webgl-engine';
import type { Entity } from './objects/entity';

export type vec2 = [number, number];
export type vec3 = [number, number, number];
export type vec4 = [number, number, number, number];

export const INFINITY = 99999999999; // Some arbitrarily long number to indicate infinity
export const FPS = 1000 / 60;
export const FOG_COLOR = [0.15, 0.15, 0.15, 1] as vec4;

// Whatever it is, keep it at a 16/9 aspect ratio
export const SCREEN_WIDTH = 1200;
export const SCREEN_HEIGHT = 675;

/**
 * This method will return a tuple with two scale factors that
 * will convert screen space to render space. You can multiply
 * them by canvas offsets (in HTML) and it will return the
 * relevant in-game position.
 */
export function getScreenScale(gl: WebGLRenderingContext) {
    const scaleX = SCREEN_WIDTH / gl.canvas.width;
    const scaleY = SCREEN_HEIGHT / gl.canvas.height;
    return [scaleX, scaleY];
}

export type ScriptFn = (
    this: Entity,
    time: number,
    engine: Engine<unknown>
) => void;

export type GameProps = {
    blurbs: string[];
};
