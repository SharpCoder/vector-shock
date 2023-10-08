import type { Engine } from 'webgl-engine';
import type { Entity } from '../objects/entity';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';

export function applyCameraFollow(player: Entity, engine: Engine<unknown>) {
    const { activeScene } = engine;
    const { camera } = activeScene;

    const THRESHOLD = 0.3;
    const maxX = camera.position[0] + SCREEN_WIDTH * (1 - THRESHOLD);
    const minX = camera.position[0] + SCREEN_WIDTH * THRESHOLD;

    if (player.position[0] > maxX) {
        camera.position[0] += player.position[0] - maxX;
    } else if (player.position[0] < minX) {
        camera.position[0] -= minX - player.position[0];
    }
}
