import {
    Default2DShader,
    Flatten,
    Repeat,
    Scene,
    rads,
    rect2D,
} from 'webgl-engine';
import type { Obj3d } from 'webgl-engine';
import { FOG_COLOR } from '../constants';

export const MenuScene = new Scene<unknown>({
    title: 'Default Scene',
    shaders: [Default2DShader],
    once: (engine) => {},
    update: (time, engine) => {},
    init: (engine) => {
        engine.settings.fogColor = FOG_COLOR;
    },
    status: 'ready',
    components: 2,
});
