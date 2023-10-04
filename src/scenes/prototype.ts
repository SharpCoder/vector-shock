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
import { spawnPlayer } from '../objects/player';
import { applyPhysics } from '../scripts/physics';

export const PrototypeScene = new Scene<unknown>({
    title: 'Prototype Scene',
    shaders: [Default2DShader],
    once: (engine) => {},
    update: function (time, engine) {
        applyPhysics(time, PrototypeScene, engine);
    },
    init: (engine) => {
        engine.settings.fogColor = FOG_COLOR;

        // Match the page with the fog color.
        document.body.style.backgroundColor = `rgba(${engine.settings.fogColor
            .slice(0, 3)
            .map((x) => x * 256)},0.95)`;
    },
    status: 'initializing',
    components: 2,
});

for (let i = 0; i < 20; i++) {
    PrototypeScene.addObject(spawnPlayer());
}
