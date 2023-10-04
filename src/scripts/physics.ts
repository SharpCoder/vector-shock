import type { Engine, Scene } from 'webgl-engine';
import type { Entity } from '../objects/entity';
import { FPS } from '../constants';

export const MAX_VEL_Y = 50;
export const MAX_VEL_X = 12;
const ACCELERATION = 3.0;
const FRICTION = 0.35;
const THRESHOLD = FRICTION;
const DECAY = 0.25;

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
            // Apply some gravity.
            entity.physics.accelerationY *= 1.09;
            entity.physics.targetVx *= DECAY;

            entity.physics.vy =
                entity.physics.vy -
                0.25 * entity.physics.accelerationY * (time / FPS);

            // Add some friction
            /*
                Basic formula:
                    - targetVx wants to go to zero.
                    - vx wants to go to targetVx.
            */
            if (entity.physics.vx < entity.physics.targetVx) {
                entity.physics.vx += FRICTION;
            } else if (entity.physics.vx > entity.physics.targetVx) {
                entity.physics.vx -= FRICTION;
            }

            // Sneaky friction
            // TODO: Not this
            if (
                Math.hypot(entity.physics.vx - entity.physics.targetVx) <
                THRESHOLD
            ) {
                entity.physics.vx +=
                    (-Math.sign(entity.physics.vx) * FRICTION) / 2.25;
            }

            if (entity.physics.targetVx > THRESHOLD) {
                entity.physics.targetVx -= ACCELERATION;
            } else if (entity.physics.targetVx < -THRESHOLD) {
                entity.physics.targetVx += ACCELERATION;
            } else {
                entity.physics.targetVx = 0;
            }

            // Cap the maximum velocities
            entity.physics.vy = Math.min(
                Math.max(entity.physics.vy, -MAX_VEL_Y),
                MAX_VEL_Y
            );

            entity.physics.vx = Math.min(
                Math.max(entity.physics.vx, -MAX_VEL_X),
                MAX_VEL_X
            );

            // Do the physics
            entity.position[0] += entity.physics.vx;
            entity.position[1] -= entity.physics.vy;

            const h = Math.abs(obj._bbox?.h ?? 0);

            // TODO: Collision with other objects
            if (entity.position[1] > gl.canvas.height - h / 2) {
                entity.position[1] = gl.canvas.height - h / 2;
                entity.physics.vy = 0;
                entity.physics.accelerationY = 1;
            }
        }
    }
}
