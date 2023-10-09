import type { Engine } from 'webgl-engine';
import type { Entity } from '../objects/entity';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';

export function applyCameraFollow(player: Entity, engine: Engine<unknown>) {
    const { activeScene } = engine;
    const { camera } = activeScene;

    const THRESHOLD = 0.3;
    const maxX = camera.position[0] + SCREEN_WIDTH * (1 - THRESHOLD);
    const minX = camera.position[0] + SCREEN_WIDTH * THRESHOLD;
    const maxY = camera.position[1] + SCREEN_HEIGHT * (1 - 0.1);
    const minY = camera.position[1] + SCREEN_HEIGHT * 0.3;

    if (player.position[0] > maxX) {
        camera.position[0] += player.position[0] - maxX;
    } else if (player.position[0] < minX) {
        camera.position[0] -= minX - player.position[0];
    }

    if (player.position[1] > maxY) {
        camera.position[1] += player.position[1] - maxY;
    } else if (player.position[1] < minY) {
        camera.position[1] -= minY - player.position[1];
    }
}
