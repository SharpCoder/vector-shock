import { m3, type ProgramTemplate, type repeat_mode } from 'webgl-engine';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import type { Entity } from '../objects/entity';

const gl = document.createElement('canvas').getContext('webgl');

const repeatMap: Record<repeat_mode, number | undefined> = {
    clamp_to_edge: gl?.CLAMP_TO_EDGE,
    mirrored_repeat: gl?.MIRRORED_REPEAT,
    repeat: gl?.REPEAT,
};

export function createShader(template: ProgramTemplate): ProgramTemplate {
    const gl = document
        .createElement('canvas')
        .getContext('webgl') as WebGLRenderingContext;

    return {
        name: template.name,
        order: template.order,
        objectDrawArgs: template.objectDrawArgs ?? {
            components: 2,
            depthFunc: gl?.LESS,
            mode: gl?.TRIANGLES,
            blend: false,
        },
        vertexShader: template.vertexShader,
        fragmentShader: template.fragmentShader,
        attributes: {
            ...template.attributes,
            a_color: {
                components: 3,
                type: gl?.UNSIGNED_BYTE,
                normalized: true,
                generateData: (engine) => {
                    return new Uint8Array(engine.activeScene.colors);
                },
            },
            a_position: {
                components: 2,
                type: gl?.FLOAT,
                normalized: false,
                generateData: (engine) => {
                    return new Float32Array(engine.activeScene.vertexes);
                },
            },
            a_texcoord: {
                components: 2,
                type: gl?.FLOAT,
                normalized: false,
                generateData: (engine) => {
                    return new Float32Array(engine.activeScene.texcoords);
                },
            },
        },
        staticUniforms: {
            ...template.staticUniforms,
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
                        m3.translate(-camera.position[0], camera.position[1]),
                        m3.rotate(camera.rotation[0]),
                        m3.translate(camera.offset[0], camera.offset[1]),
                    ])
                );
            },
        },
        dynamicUniforms: {
            ...template.dynamicUniforms,
            u_showtex: (engine, loc, obj) => {
                const { gl } = engine;
                gl.uniform1i(
                    loc,
                    obj.texture && obj.texture.enabled !== false ? 1 : 0
                );
            },
            u_visible: (engine, loc, obj) => {
                const { gl } = engine;
                gl.uniform1i(loc, obj.name.startsWith('ray_') ? 0 : 1);
            },
            u_texture: (engine, loc, obj) => {
                const { gl } = engine;
                /// Apply the current texture if relevant
                // Check if the current texture is loaded
                if (
                    obj &&
                    obj.texture &&
                    obj.texture._computed &&
                    obj.texture.enabled !== false
                ) {
                    const { webglTexture, square } = obj.texture._computed;

                    if (square) {
                        gl.bindTexture(gl.TEXTURE_2D, webglTexture);
                        gl.texParameteri(
                            gl.TEXTURE_2D,
                            gl.TEXTURE_WRAP_S,
                            repeatMap[obj.texture.repeat_horizontal] ??
                                gl.CLAMP_TO_EDGE
                        );
                        gl.texParameteri(
                            gl.TEXTURE_2D,
                            gl.TEXTURE_WRAP_T,
                            repeatMap[obj.texture.repeat_vertical] ??
                                gl.CLAMP_TO_EDGE
                        );
                        gl.uniform1i(loc, 0);
                        gl.activeTexture(gl.TEXTURE0);
                    } else {
                        gl.bindTexture(gl.TEXTURE_2D, webglTexture);
                        gl.texParameteri(
                            gl.TEXTURE_2D,
                            gl.TEXTURE_WRAP_S,
                            gl.CLAMP_TO_EDGE
                        );
                        gl.texParameteri(
                            gl.TEXTURE_2D,
                            gl.TEXTURE_WRAP_T,
                            gl.CLAMP_TO_EDGE
                        );
                        // This ensures the image is loaded into
                        // u_texture properly.
                        gl.uniform1i(loc, 1);
                        gl.activeTexture(gl.TEXTURE1);
                    }
                }
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
}
