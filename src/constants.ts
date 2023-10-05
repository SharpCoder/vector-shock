import type { Drawable, Scene } from 'webgl-engine';

export type vec2 = [number, number];
export type vec3 = [number, number, number];
export type vec4 = [number, number, number, number];

export const FPS = 1000 / 60;
export const FOG_COLOR = [0.15, 0.15, 0.15, 1] as vec4;

// Whatever it is, keep it at a 16/9 aspect ratio
export const SCREEN_WIDTH = 1200;
export const SCREEN_HEIGHT = 675;
