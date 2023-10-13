import { rect2D, Flatten, Repeat, zeros, tex2D } from 'webgl-engine';
import { Entity } from './entity';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';

export function spawnWallpaper(): Entity {
    const w = SCREEN_WIDTH * 4;
    const h = SCREEN_HEIGHT * 4;
    const wallpaper = new Entity({
        name: `wallpaper`,
        applyPhysics: false,
        collidable: false,
        reflective: false,
        vertexes: rect2D(w, h),
        colors: Flatten([Repeat([0, 0, 0], 6)]),
        offsets: [-w / 2, -SCREEN_HEIGHT, 0],
        position: [0, 0, 0],
        rotation: zeros(),
        zIndex: -2,
        hidden: true,
        texture: {
            repeat_horizontal: 'repeat',
            repeat_vertical: 'repeat',
            uri: './assets/wall.png',
            enabled: true,
        },
        texcoords: tex2D(w / 32 / 2, h / 32 / 2),
        update: function (time, engine) {
            const { camera } = engine.activeScene;
            this.position[0] = camera.position[0] * 0.9;
            this.position[1] = camera.position[1] * 0.9;
        },
    });

    return wallpaper;
}
