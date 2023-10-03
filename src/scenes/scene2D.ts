import {
    Default2DShader,
    DefaultShader,
    Flatten,
    Repeat,
    Scene,
    cuboid,
    rads,
    rect2D,
    zeros,
} from 'webgl-engine';
import type { Obj3d } from 'webgl-engine';

export const DefaultScene2D = new Scene<unknown>({
    title: 'Default Scene',
    shaders: [Default2DShader],
    once: (engine) => {},
    update: (time, engine) => {},
    init: (engine) => {
        engine.settings.fogColor = [1, 1, 1, 1];
        const { camera } = DefaultScene2D;
    },
    status: 'initializing',
    components: 2,
});

const w = 200;
const h = 200;

const rectangle: Obj3d = {
    name: 'rectangle',
    vertexes: rect2D(w, h),
    colors: Flatten([Repeat([255, 0, 255], 3), Repeat([0, 255, 255], 3)]),
    offsets: [-w / 2, -h / 2, 0],
    position: [200, 200, 0],
    rotation: [0, 0, 0],
    update: (time, engine) => {
        const { gl } = engine;
        rectangle.rotation[0] += rads(time / 20);
    },
};

DefaultScene2D.addObject(rectangle);
