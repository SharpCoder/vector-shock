import { SCREEN_WIDTH } from '../constants';
import type { MapDefinition } from '../map';

export const Puzzle1: MapDefinition = {
    name: 'Training Room',
    width: SCREEN_WIDTH,
    objects: [
        {
            type: 'button',
            ref: 'button_1',
            x: 200,
            y: 200,
        },
        {
            type: 'platform',
            ref: 'platform_1',
            scripts: [
                {
                    name: 'moveWhenHit',
                    args: ['button_1', 300, [0, -1]],
                },
            ],
            x: 600,
            y: 400,
            w: 120,
            h: 5,
        },
    ],
};
