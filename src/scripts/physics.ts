import { loadModel, type Engine, type Scene, type bbox } from 'webgl-engine';
import type { Entity } from '../objects/entity';
import { FPS, SCREEN_HEIGHT } from '../constants';
import { point, pointInRect, type Rect } from '../algebra';

export const MAX_VEL_Y = 50;
export const MAX_VEL_X = 4;
const ACCELERATION = 3.0;
const FRICTION = 0.35;
const THRESHOLD = FRICTION;
const DECAY = 0.25;

function dist(a: Entity, b: Entity) {
    return Math.hypot(
        a.position[0] - b.position[0],
        a.position[1] - b.position[1]
    );
}

function getPoints(box: Rect, entity: Entity) {
    const h = box.h - entity.physics.vy;

    return {
        p1: point(box.x, box.y),
        p2: point(box.x + box.w, box.y),
        p3: point(box.x, box.y + h),
        p4: point(box.x + box.w, box.y + h),
    };
}

function colliding(a: Entity, b: Entity) {
    if (!a._bbox) return false;
    if (!b._bbox) return false;
    if (a === b) return false;

    const aRect = a.getBbox();
    const aPoints = getPoints(aRect, a);
    const bRect = b.getBbox();
    const bPoints = getPoints(bRect, b);

    const horizontal =
        aPoints.p1.x > bPoints.p1.x && aPoints.p1.x < bPoints.p2.x;

    return (
        pointInRect(aPoints.p1, bRect) ||
        pointInRect(aPoints.p2, bRect) ||
        pointInRect(aPoints.p3, bRect) ||
        pointInRect(aPoints.p4, bRect) ||
        (bPoints.p1.x < aPoints.p1.x &&
            bPoints.p1.y > aPoints.p1.y &&
            bPoints.p2.x > aPoints.p2.x &&
            bPoints.p2.y > aPoints.p2.y &&
            bPoints.p3.x < aPoints.p3.x &&
            bPoints.p3.y < aPoints.p3.y &&
            bPoints.p4.x > aPoints.p4.x &&
            bPoints.p4.y < aPoints.p4.y)
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

            // Do collision
            // TODO: This is not going to work for walls
            const activeCollisions = collidables
                .filter((x) => x != entity)
                .filter(
                    (x) =>
                        entity.physics.vy < 0 && colliding(entity, x as Entity)
                );

            activeCollisions.sort((a, b) => dist(b as Entity, a as Entity));

            // console.log(activeCollisions);
            const collidedWith = activeCollisions[0];

            const h = Math.abs(entity.getBbox().h ?? 0);

            if (collidedWith && entity._bbox && collidedWith._bbox) {
                entity.physics.vy = 0;
                entity.physics.accelerationY = 1;
                entity.position[1] =
                    collidedWith.position[1] -
                    collidedWith._bbox?.w / 2 -
                    entity._bbox?.w / 2;
            } else if (entity.position[1] > screenHeight - h / 2) {
                entity.position[1] = screenHeight - h / 2;
                entity.physics.vy = 0;
                entity.physics.accelerationY = 1;
            } else {
                // Do the physics
                entity.position[1] -= entity.physics.vy;
            }

            entity.position[0] += entity.physics.vx * 2.25;
        }
    }
}

loadModel('./assets/plane.obj', 'obj', true).then((model) => {
    console.log(model);
});
