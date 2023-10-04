import type { Engine, Scene } from 'webgl-engine';
import type { Entity } from '../objects/entity';
import { FPS } from '../constants';

export function applyPhysics(
    time: number,
    scene: Scene<unknown>,
    engine: Engine<unknown>
) {
    const { gl } = engine;
    if (!gl) return;

    for (const obj of scene.objects) {
        const entity = obj as Entity;
        if (entity.applyPhysics) {
            // Apply some velocity to it.
            entity.physics.acceleration *= 1.09;
            entity.physics.vy =
                entity.physics.vy -
                0.25 * entity.physics.acceleration * (time / FPS);

            // Do the physics
            entity.position[0] += entity.physics.vx;
            entity.position[1] -= entity.physics.vy;

            const h = Math.abs(obj._bbox?.h ?? 0);

            // TODO: Collision with other objects
            if (entity.position[1] > gl.canvas.height - h / 2) {
                entity.position[1] = gl.canvas.height - h / 2;
                entity.physics.vy = 0;
                entity.physics.vx = 0;
                entity.physics.acceleration = 1;
            }
        }
    }
}
