import { Scene, rads } from 'webgl-engine';
import { FOG_COLOR } from '../constants';
import { spawnPlayer } from '../objects/player';
import { applyPhysics } from '../scripts/physics';
import { DefaultShader } from '../shaders/default';
import { applyRayCasting } from '../scripts/raycasting';
import { BeamShader } from '../shaders/beam';
import { applyCameraFollow } from '../scripts/cameraFollow';
import { loadMap } from '../map';
import { Puzzle1 } from '../levels/puzzle_1';
import { WallpaperShader } from '../shaders/wallpaper';

const player = spawnPlayer({});
export const PrototypeScene = new Scene<unknown>({
    title: 'Prototype Scene',
    shaders: [WallpaperShader, DefaultShader, BeamShader],
    once: (engine) => {},
    update: function (time, engine) {
        applyPhysics(PrototypeScene, engine);
        applyRayCasting(player, PrototypeScene, engine);
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

// const topPlatform = spawnPlatform(800, SCREEN_HEIGHT - 500, 120, 5);
// const lowerPlatform = spawnPlatform(600, SCREEN_HEIGHT - 180, 120, 5);

PrototypeScene.addObject(player);

// PrototypeScene.addObject(
//     spawnButton(200, 100, () => {
//         topPlatform.properties.activated = new Date().getTime();
//     })
// );

// const SHIELD_OFFSET_Y = 50;
// PrototypeScene.addObject(spawnShielded(200, 150 + SHIELD_OFFSET_Y, 100, 5));
// PrototypeScene.addObject(
//     spawnShielded(250, 100 + SHIELD_OFFSET_Y + 2.5, 5, 100)
// );
// PrototypeScene.addObject(spawnMirror(110, 220, 5, 100, ['center_vertical']));
// PrototypeScene.addObject(lowerPlatform);
// PrototypeScene.addObject(topPlatform);

const map = loadMap(Puzzle1);

for (const segment of map) {
    PrototypeScene.addObject(segment);
}
