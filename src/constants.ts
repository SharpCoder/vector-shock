import type { Drawable, Scene } from 'webgl-engine';

export type vec2 = [number, number];
export type vec3 = [number, number, number];
export type vec4 = [number, number, number, number];

export const FPS = 1000 / 60;
export const FOG_COLOR = [0.15, 0.15, 0.15, 1] as vec4;

export type PhysicsAttributes = {
    vx: number;
    vy: number;
};
