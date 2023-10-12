import {
    rect2D,
    Flatten,
    Repeat,
    zeros,
    tex2D,
    rads,
    m4,
    m3,
} from 'webgl-engine';
import { Entity } from './entity';

export function spawnTile(
    x: number,
    y: number,
    w: number,
    h: number,
    size: number,
    rotation?: number
): Entity {
    const texcoordsBase = tex2D(w / size, h / size);
    const texcoords = [];

    // Rotate the texture
    for (let i = 0; i < texcoordsBase.length; i += 2) {
        const mat = m3.combine([
            m3.rotate(rotation ?? 0),
            m3.translate(texcoordsBase[i], texcoordsBase[i + 1]),
        ]);

        texcoords.push(mat[6]);
        texcoords.push(mat[7]);
    }

    const tile = new Entity({
        name: `tile_${x}_${y}_${size}`,
        applyPhysics: false,
        collidable: true,
        reflective: false,
        vertexes: rect2D(w, h),
        colors: Flatten([Repeat([255, 0, 0], 6)]),
        offsets: [0, 0, 0],
        position: [x, y, 0],
        rotation: zeros(),
        preMatrix: m3.rotate(rotation ?? 0),
        zIndex: 0,
        texture: {
            repeat_horizontal: 'repeat',
            repeat_vertical: 'repeat',
            uri: './assets/tile.png',
            enabled: true,
        },
        texcoords,
        update: function (time, engine) {},
    });

    return tile;
}
