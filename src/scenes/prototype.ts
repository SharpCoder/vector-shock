import { Scene } from 'webgl-engine';
import { FOG_COLOR } from '../constants';
import { spawnPlayer } from '../objects/player';
import { applyPhysics } from '../scripts/physics';
import { spawnPlatform } from '../objects/platform';
import { PrimaryShader } from '../shaders/primary';

export const PrototypeScene = new Scene<unknown>({
    title: 'Prototype Scene',
    shaders: [PrimaryShader],
    once: (engine) => {},
    update: function (time, engine) {
        applyPhysics(time, PrototypeScene, engine);
    },
    init: (engine) => {
        engine.settings.fogColor = FOG_COLOR;

        // Match the page with the fog color.
        document.body.style.backgroundColor = `rgba(${engine.settings.fogColor.map(
            (x) => x * 220
        )})`;
    },
    status: 'initializing',
    components: 2,
});

PrototypeScene.addObject(spawnPlayer());
PrototypeScene.addObject(spawnPlatform(500, 300, 200, 10));
