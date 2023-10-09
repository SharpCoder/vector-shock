import { SCREEN_HEIGHT, SCREEN_WIDTH } from './constants';
import type { Entity } from './objects/entity';
import { spawnTile } from './objects/tile';
import { spawnWallpaper } from './objects/wallpaper';

export type MapDefinition = {
    width: number;
};

export function loadMap(def: MapDefinition): Entity[] {
    const objects: Entity[] = [];
    objects.push(spawnWallpaper());

    // Build the floor
    const tileSize = 64;
    objects.push(
        spawnTile(
            0,
            SCREEN_HEIGHT - tileSize / 2,
            tileSize * 100,
            tileSize,
            tileSize
        )
    );

    return objects;
}
