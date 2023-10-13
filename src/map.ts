import { rads } from 'webgl-engine';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './constants';
import type { Entity, Surface } from './objects/entity';
import { spawnTile } from './objects/tile';
import { spawnWallpaper } from './objects/wallpaper';
import { spawnButton } from './objects/button';
import { spawnPlatform } from './objects/platform';
import type { ScriptDefinition } from './scripts/objectScripts';
import { spawnDoorway } from './objects/doorway';
import { spawnMirror } from './objects/mirror';

export const TILE_SIZE = 48;

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

type DoorwayObject = Base & {
    type: 'doorway';
};

type ButtonObject = Base & {
    type: 'button';
};

type MirrorObject = Base &
    Dimensioned & {
        type: 'mirror';
        surfaces: Surface[];
    };

type MapObject = PlatformObject | ButtonObject | DoorwayObject | MirrorObject;

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

        case 'doorway': {
            return spawnDoorway(def.ref, def.x, def.y);
        }

        case 'mirror': {
            return spawnMirror(
                def.ref,
                def.x,
                def.y,
                def.w,
                def.h,
                def.surfaces
            );
        }
    }
}

export function loadMap(def: MapDefinition): Entity[] {
    const objects: Entity[] = [];
    objects.push(spawnWallpaper());

    // Build the floor
    const ox = 0;
    objects.push(spawnTile(ox, SCREEN_HEIGHT, def.width, TILE_SIZE, TILE_SIZE));

    // Walls
    objects.push(
        spawnTile(
            def.width - TILE_SIZE,
            SCREEN_HEIGHT - TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE * 20,
            TILE_SIZE,
            rads(90)
        )
    );
    objects.push(
        spawnTile(
            ox,
            SCREEN_HEIGHT - TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE * 20,
            TILE_SIZE,
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
