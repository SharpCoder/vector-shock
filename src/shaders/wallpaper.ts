// @ts-nocheck
import { createShader } from './base';

const vertexShader = `
    attribute vec3 a_color;
    attribute vec2 a_position;
    attribute vec2 a_texcoord;

    uniform mat3 u_proj;
    uniform mat3 u_camera;
    uniform mat3 u_mat;
    uniform bool u_show;

    varying vec4 v_color;
    varying vec2 v_texcoord;
    varying vec2 v_pos;

    void main() {
        if (u_show) {
            gl_Position = vec4(vec3(u_proj * u_camera * u_mat * vec3(a_position, 1)).xy, 0, 1);
            v_color = vec4(a_color, 1);
            v_texcoord = vec2(a_texcoord.x, 1. - a_texcoord.y);
            v_pos = gl_Position.xy;
        }
    }
`;

const fragmentShader = `
    precision mediump float;
    varying vec4 v_color;
    varying vec2 v_texcoord;
    varying vec2 v_pos;
    uniform float u_time;

    // The texture
    uniform sampler2D u_texture;
    uniform bool u_showtex;

    void main() {
        vec2 st = v_texcoord/0.5;
        vec2 ipos = floor(st);
        float pct = v_pos.y-.35;//*sin(u_time);

        // Clamp pct
        pct = clamp(pct, -1.,1.);

        gl_FragColor = vec4(
            mix(
                texture2D(u_texture, v_texcoord).xyz,
                // vec3(0,0,1),
                vec3(0.9,.2,.4),
                pct
            ),
            1
        );
    }
`;

const gl = document.createElement('canvas').getContext('webgl');
export const WallpaperShader = createShader({
    name: 'wallpaper',
    order: 3,
    objectDrawArgs: {
        components: 2,
        depthFunc: gl?.LESS,
        mode: gl?.TRIANGLES,
        blend: false,
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
    vertexShader,
    fragmentShader,
    attributes: {},
    staticUniforms: {
        u_time: (engine, loc) => {
            const { gl } = engine;
            const time = new Date().getTime();
            gl.uniform1f(
                loc,
                Math.round(((time / 1250) % (Math.PI * 1)) * 7.0) / 7.0
            );
        },
    },
    dynamicUniforms: {
        u_show: (engine, loc, obj) => {
            const { gl } = engine;
            gl.uniform1i(loc, obj.name === 'wallpaper' ? 1 : 0);
        },
    },
});
