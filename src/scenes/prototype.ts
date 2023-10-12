import { Scene, rads } from 'webgl-engine';
import { FOG_COLOR, SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { spawnPlayer } from '../objects/player';
import { applyPhysics } from '../scripts/physics';
import { spawnPlatform } from '../objects/platform';
import { DefaultShader } from '../shaders/default';
import { applyRayCasting } from '../scripts/raycasting';
import { BeamShader } from '../shaders/beam';
import { spawnButton } from '../objects/button';
import { applyCameraFollow } from '../scripts/cameraFollow';
import { loadMap } from '../map';
import { spawnShielded } from '../objects/shielded';
import { spawnMirror } from '../objects/mirror';

const player = spawnPlayer({});
export const PrototypeScene = new Scene<unknown>({
    title: 'Prototype Scene',
    shaders: [DefaultShader, BeamShader],
    once: (engine) => {},
    update: function (time, engine) {
        applyRayCasting(player, PrototypeScene, engine);
        applyPhysics(PrototypeScene, engine);
        applyCameraFollow(player, engine);
    },
    init: (engine) => {
        engine.settings.fogColor = FOG_COLOR;

        // Match the page with the fog color.
        document.body.style.backgroundColor = `rgba(${engine.settings.fogColor.map(
            (x) => x * 150
        )})`;
    },
    status: 'initializing',
    components: 2,
});

const topPlatform = spawnPlatform(800, SCREEN_HEIGHT - 500, 120, 5);
const lowerPlatform = spawnPlatform(600, SCREEN_HEIGHT - 180, 120, 5);

PrototypeScene.addObject(player);

PrototypeScene.addObject(
    spawnButton(200, 100, () => {
        topPlatform.properties.activated = new Date().getTime();
    })
);

const SHIELD_OFFSET_Y = 50;
PrototypeScene.addObject(spawnShielded(200, 150 + SHIELD_OFFSET_Y, 100, 5));
PrototypeScene.addObject(spawnShielded(250, 100 + SHIELD_OFFSET_Y, 5, 100));
PrototypeScene.addObject(spawnMirror(100, 220, 5, 100, ['center_vertical']));
PrototypeScene.addObject(lowerPlatform);
PrototypeScene.addObject(topPlatform);

const map = loadMap({
    width: SCREEN_WIDTH * 4,
});

for (const segment of map) {
    PrototypeScene.addObject(segment);
}
