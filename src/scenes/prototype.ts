import { Scene, rads } from 'webgl-engine';
import { FOG_COLOR, SCREEN_HEIGHT } from '../constants';
import { spawnPlayer } from '../objects/player';
import { applyPhysics } from '../scripts/physics';
import { spawnPlatform } from '../objects/platform';
import { DefaultShader } from '../shaders/default';
import { applyRayTracing } from '../scripts/raytracing';

const player = spawnPlayer({});
export const PrototypeScene = new Scene<unknown>({
    title: 'Prototype Scene',
    shaders: [DefaultShader],
    once: (engine) => {},
    update: function (time, engine) {
        applyPhysics(time, PrototypeScene, engine);
        applyRayTracing(player, PrototypeScene, engine);
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

PrototypeScene.addObject(player);
PrototypeScene.addObject(spawnPlatform(600, SCREEN_HEIGHT - 180, 200, 5));
PrototypeScene.addObject(spawnPlatform(800, SCREEN_HEIGHT - 400, 200, 5));
PrototypeScene.addObject(
    spawnPlatform(20, SCREEN_HEIGHT / 2, 5, SCREEN_HEIGHT)
);
