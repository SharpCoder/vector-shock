import { SCREEN_HEIGHT } from './constants';
import type { Entity } from './objects/entity';
import { spawnTile } from './objects/tile';

export type MapDefinition = {
    width: number;
};

export function loadMap(def: MapDefinition): Entity[] {
    const objects: Entity[] = [];

    // Build the floor
    const tileSize = 100;
    objects.push(
        spawnTile(
            0,
            SCREEN_HEIGHT - tileSize / 2,
            tileSize * 200,
            tileSize,
            tileSize
        )
    );

    return objects;
}
