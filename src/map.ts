import { rads } from 'webgl-engine';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './constants';
import type { Entity } from './objects/entity';
import { spawnTile } from './objects/tile';
import { spawnWallpaper } from './objects/wallpaper';
import { spawnButton } from './objects/button';
import { spawnPlatform } from './objects/platform';
import type { ScriptDefinition } from './scripts/objectScripts';

type Base = {
    ref: string;
    x: number;
    y: number;
    scripts?: ScriptDefinition[];
};

type Dimensioned = {
    w: number;
    h: number;
};

type PlatformObject = Base &
    Dimensioned & {
        type: 'platform';
    };

type ButtonObject = Base & {
    type: 'button';
};

type MapObject = PlatformObject | ButtonObject;

export type MapDefinition = {
    name: string;
    width: number;
    objects: MapObject[];
};

function spawnEntity(def: MapObject) {
    switch (def.type) {
        case 'platform': {
            return spawnPlatform(def.ref, def.x, def.y, def.w, def.h);
        }

        case 'button': {
            return spawnButton(def.ref, def.x, def.y);
        }
    }
}

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
        const entity = spawnEntity(obj);
        if (obj.scripts) {
            entity.attachScripts(obj.scripts);
        }
        objects.push(entity);
    }

    return objects;
}
