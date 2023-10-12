import { rads } from 'webgl-engine';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './constants';
import type { Entity } from './objects/entity';
import { spawnTile } from './objects/tile';
import { spawnWallpaper } from './objects/wallpaper';
import { spawnButton } from './objects/button';
import { spawnPlatform } from './objects/platform';

export type MapObject = {
    type: 'wall' | 'platform' | 'mirror' | 'shield' | 'button';
    ref: string;
    x: number;
    y: number;
    w?: number;
    h?: number;
    scripts?: {
        name: string;
        args: any[];
    }[];
};

export type MapDefinition = {
    name: string;
    width: number;
    objects: MapObject[];
};

export function loadMap(def: MapDefinition): Entity[] {
    const objects: Entity[] = [];
    objects.push(spawnWallpaper());

    // Build the floor
    const tileSize = 64;
    const ox = 0;
    objects.push(spawnTile(ox, SCREEN_HEIGHT, def.width, tileSize, tileSize));

    // Walls
    objects.push(
        spawnTile(
            def.width - tileSize,
            SCREEN_HEIGHT - tileSize,
            tileSize,
            tileSize * 20,
            tileSize,
            rads(90)
        )
    );
    objects.push(
        spawnTile(
            ox,
            SCREEN_HEIGHT - tileSize,
            tileSize,
            tileSize * 20,
            tileSize,
            rads(-90)
        )
    );

    // Spawn the objects
    for (const obj of def.objects) {
        switch (obj.type) {
            case 'button': {
                objects.push(spawnButton(obj.ref, obj.x, obj.y));
                break;
            }

            case 'platform': {
                objects.push(
                    spawnPlatform(
                        obj.ref,
                        obj.x,
                        obj.y,
                        obj.w ?? 0,
                        obj.h ?? 0,
                        obj.scripts
                    )
                );
                break;
            }
        }
    }

    return objects;
}
