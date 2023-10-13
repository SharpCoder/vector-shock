import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { TILE_SIZE, type MapDefinition } from '../map';

export const Puzzle1: MapDefinition = {
    name: 'Training Room',
    width: SCREEN_WIDTH * 10,
    objects: [
        {
            type: 'button',
            ref: 'button_1',
            x: 800,
            y: 400,
        },
        {
            type: 'mirror',
            ref: 'mirror_1',
            x: 380,
            w: 300,
            y: 100,
            h: 4,
            surfaces: ['south'],
        },
        {
            type: 'mirror',
            ref: 'mirror_2',
            x: 500,
            w: 100,
            y: 300,
            h: 4,
            surfaces: ['center_horizontal', 'south'],
        },
        {
            type: 'doorway',
            ref: 'doorway_1',
            x: 400,
            y: SCREEN_HEIGHT - TILE_SIZE,
            scripts: [
                {
                    type: 'disappearWhenHit',
                    target_ref: ['button_1'],
                },
            ],
        },
    ],
};
