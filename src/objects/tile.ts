import { rect2D, Flatten, Repeat, zeros, tex2D } from 'webgl-engine';
import { Entity } from './entity';

export function spawnTile(
    x: number,
    y: number,
    w: number,
    h: number,
    size: number
): Entity {
    console.log(w / size);
    const tile = new Entity({
        name: `tile_${size}`,
        applyPhysics: false,
        collidable: true,
        reflective: false,
        vertexes: rect2D(w, h),
        colors: Flatten([Repeat([255, 0, 0], 6)]),
        offsets: [-w / 2, -h / 2, 0],
        position: [x, y, 0],
        rotation: zeros(),
        zIndex: 0,
        texture: {
            repeat_horizontal: 'repeat',
            repeat_vertical: 'clamp_to_edge',
            uri: './assets/tile.png',
            enabled: true,
        },
        texcoords: tex2D(w / size, h / size),
        update: function (time, engine) {},
    });

    return tile;
}
