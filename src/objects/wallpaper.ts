import { rect2D, Flatten, Repeat, zeros, tex2D } from 'webgl-engine';
import { Entity } from './entity';

export function spawnWallpaper(
    x: number,
    y: number,
    w: number,
    h: number
): Entity {
    const wallpaper = new Entity({
        name: `wallpaper_${w * h}`,
        applyPhysics: false,
        collidable: false,
        reflective: false,
        vertexes: rect2D(w, h),
        colors: Flatten([Repeat([204, 255, 0], 6)]),
        offsets: [-w / 2, -h, 0],
        position: [x, y, 0],
        rotation: zeros(),
        zIndex: 999,
        texture: {
            repeat_horizontal: 'clamp_to_edge',
            repeat_vertical: 'clamp_to_edge',
            uri: './assets/bg.png',
            enabled: true,
        },
        texcoords: tex2D(1, 1),
        update: function (time, engine) {},
    });

    return wallpaper;
}
