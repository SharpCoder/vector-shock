import type { Engine, Scene, bbox } from 'webgl-engine';
import type { Entity } from '../objects/entity';
import { FPS, SCREEN_HEIGHT } from '../constants';

export const MAX_VEL_Y = 50;
export const MAX_VEL_X = 4;
const ACCELERATION = 3.0;
const FRICTION = 0.35;
const THRESHOLD = FRICTION;
const DECAY = 0.25;

function getRect(box: bbox) {
    return {
        x0: box.x,
        x1: box.x - box.w,
        y0: box.y,
        y1: box.y - box.h,
    };
}

function colliding(a: Entity, b: Entity) {
    if (!a._bbox) return false;
    if (!b._bbox) return false;
    if (a === b) return false;

    const ra = getRect(a.getBbox());
    const rb = getRect(b.getBbox());

    return (
        (ra.x1 > rb.x0 && ra.x0 < rb.x1 && ra.y0 < rb.y0 && ra.y0 > rb.y1) ||
        (ra.x1 > rb.x0 && ra.x1 < rb.x1 && ra.y1 < rb.y0 && ra.y1 > rb.y1)
    );
}

export function applyPhysics(
    time: number,
    scene: Scene<unknown>,
    engine: Engine<unknown>
) {
    const { gl } = engine;
    if (!gl) return;

    const screenHeight = SCREEN_HEIGHT;

    const collidables = scene.objects.filter(
        (obj) => (obj as Entity).collidable
    );

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
            if (
                Math.hypot(entity.physics.vx - entity.physics.targetVx) <
                THRESHOLD
            ) {
                entity.physics.movementDuration += time;
                entity.physics.vx +=
                    (-Math.sign(entity.physics.vx) * FRICTION) / 2.25;
            } else {
                entity.physics.movementDuration = 0;
            }

            if (entity.physics.movementDuration > 10.0) {
                entity.physics.vx = 0;
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
            entity.position[0] += entity.physics.vx * 2;
            entity.position[1] -= entity.physics.vy;

            // Do collision
            // TODO: This is not going to work for walls
            const collidedWith = collidables
                .filter((x) => x != obj)
                .filter(
                    (x) =>
                        entity.physics.vy < 0 && colliding(entity, x as Entity)
                )
                .at(0);

            if (collidedWith && entity._bbox && collidedWith._bbox) {
                entity.physics.vy = 0;
                entity.physics.accelerationY = 1;
                entity.position[1] =
                    collidedWith.position[1] -
                    collidedWith._bbox?.w / 2 -
                    entity._bbox?.w / 2;
            }

            // Collision with the floor
            const h = Math.abs(obj._bbox?.h ?? 0);
            if (entity.position[1] > screenHeight - h / 2) {
                entity.position[1] = screenHeight - h / 2;
                entity.physics.vy = 0;
                entity.physics.accelerationY = 1;
            }
        }
    }
}
