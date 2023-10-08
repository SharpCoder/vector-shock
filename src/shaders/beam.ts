// @ts-nocheck

import { m3, type ProgramTemplate } from 'webgl-engine';
import { FPS, SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import type { Entity } from '../objects/entity';

const default2DVertexShader = `
    attribute vec2 a_position;

    uniform mat3 u_proj;
    uniform mat3 u_camera;
    uniform mat3 u_mat;
    uniform bool u_isBeam;

    varying vec4 v_color;
    varying vec2 v_texcoord;
    

    void main() {
        if (u_isBeam) {
            gl_Position = vec4(vec3(u_proj * u_camera * u_mat * vec3(a_position, 1)).xy, 0, 1);
            
            vec2 xy = vec3( vec3(a_position, 1)).xy;
            v_texcoord = vec2(xy.x, xy.y);
        } else {
            gl_Position = vec4(0,0,0,0);
        }
    }
`;

const default2DFragmentShader = `
    precision mediump float;
    
    #define PI 3.1415926538

    varying vec4 v_color;
    varying vec2 v_texcoord;
    uniform float u_time;
    vec3 colorA = vec3(0,.4,.8);
    vec3 colorB = vec3(.2,.8,1);

    float random (in vec2 _st) {
        return fract(sin(dot(_st.xy,
                             vec2(12.9898,78.233)))*
            43758.5453123);
    }

    void main() {

        vec2 st = v_texcoord / 10.;
        vec2 ipos = floor(st);
        float pct = random(ipos*u_time);

        gl_FragColor = vec4(mix(colorA, colorB, pct), 1.);
    }
`;

const gl = document
    .createElement('canvas')
    .getContext('webgl') as WebGLRenderingContext;

export const BeamShader: ProgramTemplate = {
    name: 'beam',
    order: 1,
    objectDrawArgs: {
        components: 2,
        depthFunc: gl?.LESS,
        mode: gl?.TRIANGLES,
        blend: true,
    },
    beforeDraw(engine) {
        const { gl } = engine;
        gl.blendFuncSeparate(
            gl.SRC_ALPHA,
            gl.ONE_MINUS_SRC_ALPHA,
            gl.ZERO,
            gl.ONE
        );
    },
    vertexShader: default2DVertexShader,
    fragmentShader: default2DFragmentShader,
    attributes: {
        a_position: {
            components: 2,
            type: gl?.FLOAT,
            normalized: false,
            generateData: (engine) => {
                return new Float32Array(engine.activeScene.vertexes);
            },
        },
    },
    staticUniforms: {
        u_proj: (engine, loc) => {
            const { gl } = engine;
            gl.uniformMatrix3fv(
                loc,
                false,
                m3.projection(SCREEN_WIDTH, -SCREEN_HEIGHT)
            );
        },
        u_camera: (engine, loc) => {
            const { gl } = engine;
            const { camera } = engine.activeScene;

            gl.uniformMatrix3fv(
                loc,
                false,
                m3.combine([
                    m3.translate(camera.position[0], camera.position[1]),
                    m3.rotate(camera.rotation[0]),
                    m3.translate(camera.offset[0], camera.offset[1]),
                ])
            );
        },
        u_time: (engine, loc) => {
            const { gl } = engine;
            const time = new Date().getTime();

            gl.uniform1f(
                loc,
                Math.round(((time / 300) % (Math.PI * 2)) * 7.0) / 7.0
            );
        },
    },
    dynamicUniforms: {
        u_isBeam: (engine, loc, obj) => {
            const { gl } = engine;
            gl.uniform1i(loc, obj.name.startsWith('ray_') ? 1 : 0);
        },
        u_mat: (engine, loc, obj) => {
            const { gl } = engine;
            const entity = obj as Entity;
            if (entity.getMatrix) {
                gl.uniformMatrix3fv(
                    loc,
                    false,
                    m3.combine([entity.getMatrix()])
                );
            } else {
                console.error(
                    `Drawable ${obj.name} is not a proper entity type`
                );
            }
        },
    },
};
