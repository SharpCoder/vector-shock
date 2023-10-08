import { rect2D, Flatten, Repeat, zeros, tex2D } from 'webgl-engine';
import { Entity } from './entity';

export function spawnTile(x: number, y: number, size: number): Entity {
    const platform = new Entity({
        name: `tile_${size}`,
        applyPhysics: false,
        collidable: true,
        reflective: false,
        vertexes: rect2D(size, size),
        colors: Flatten([Repeat([204, 255, 0], 6)]),
        offsets: [-size / 2, -size / 2, 0],
        position: [x, y, 0],
        rotation: zeros(),
        texture: {
            repeat_horizontal: 'clamp_to_edge',
            repeat_vertical: 'clamp_to_edge',
            uri: './assets/tile.png',
            enabled: true,
        },
        texcoords: tex2D(1, 1),
        update: function (time, engine) {},
    });

    return platform;
}
