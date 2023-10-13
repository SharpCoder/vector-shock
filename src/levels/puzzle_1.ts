import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import type { MapDefinition } from '../map';

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
            type: 'doorway',
            ref: 'doorway_1',
            x: 400,
            y: SCREEN_HEIGHT - 48,
            scripts: [{ type: 'disappearWhenHit', target_ref: 'button_1' }],
        },
        // {
        //     type: 'platform',
        //     ref: 'platform_1',
        //     scripts: [
        //         {
        //             type: 'moveWhenHit',
        //             dist: 400,
        //             move_vec: [0, -2],
        //             target_ref: 'button_1',
        //         },
        //     ],
        //     x: 900,
        //     y: 400,
        //     w: 120,
        //     h: 5,
        // },
    ],
};
