// @ts-nocheck

import { type ProgramTemplate } from 'webgl-engine';
import { createShader } from './base';

const default2DVertexShader = `
    attribute vec3 a_color;
    attribute vec2 a_position;
    attribute vec2 a_texcoord;

    uniform mat3 u_proj;
    uniform mat3 u_camera;
    uniform mat3 u_mat;
    uniform bool u_visible;

    varying vec4 v_color;
    varying vec2 v_texcoord;

    void main() {
        if (u_visible) {
            gl_Position = vec4(vec3(u_proj * u_camera * u_mat * vec3(a_position, 1)).xy, 0, 1);
            v_color = vec4(a_color, 1);
            v_texcoord = vec2(a_texcoord.x, 1. - a_texcoord.y);
        }
    }
`;

const default2DFragmentShader = `
    precision mediump float;
    varying vec4 v_color;
    varying vec2 v_texcoord;
    
    // The texture
    uniform sampler2D u_texture;
    uniform bool u_showtex;

    void main() {
        if (u_showtex) {
            gl_FragColor = texture2D(u_texture, v_texcoord);
        } else {
            gl_FragColor = v_color;
        }
    }
`;

const gl = document
    .createElement('canvas')
    .getContext('webgl') as WebGLRenderingContext;

export const DefaultShader = createShader({
    name: 'default',
    order: 0,
    vertexShader: default2DVertexShader,
    fragmentShader: default2DFragmentShader,
    attributes: {},
    staticUniforms: {},
    dynamicUniforms: {},
});
