import { SCREEN_HEIGHT } from './constants';
import type { Entity } from './objects/entity';
import { spawnTile } from './objects/tile';
import { spawnWallpaper } from './objects/wallpaper';

export type MapDefinition = {
    width: number;
};

export function loadMap(def: MapDefinition): Entity[] {
    const objects: Entity[] = [];

    // Build the floor
    const tileSize = 48;
    for (let i = 0; i < def.width / tileSize; i++) {
        objects.push(
            spawnTile(i * tileSize, SCREEN_HEIGHT - tileSize / 2, tileSize)
        );
    }

    return objects;
}
