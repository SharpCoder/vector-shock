import { type Engine, type Scene, r, m4, m3 } from 'webgl-engine';
import type { Entity } from '../objects/entity';
import { FPS, SCREEN_HEIGHT } from '../constants';
import {
    convertToInterceptFormula,
    lineIntersection,
    makeLine,
    point,
    pointInRect,
    type Point,
    type Rect,
    segmentsIntersect,
} from '../algebra';

export const MAX_VEL_Y = 100;
export const MAX_VEL_X = 4;

export const IMPULSE_VEL_X = 4;
export const IMPULSE_VEL_Y = 30;

const ACCELERATION = 3.0;
const FRICTION = 0.35;
const G = 0.25;
const THRESHOLD = FRICTION;
const DECAY = 0.25;

function dist(a: number[], b: number[]) {
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
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

function getEdge(entity: Entity): Point {
    // Compute the vector
    const bbox = entity.getBbox();
    const v = [
        bbox.x + bbox.w / 2 + entity.physics.vx,
        bbox.y + bbox.h / 2 - entity.physics.vy,
    ];

    // Compute 4 points
    const points = [
        [bbox.x + bbox.w / 2, bbox.y],
        [bbox.x + bbox.w / 2, bbox.y + bbox.h],
        [bbox.x, bbox.y + bbox.h / 2],
        [bbox.x + bbox.w, bbox.y + bbox.h / 2],
    ];

    // Find the closest point
    const sorted = points
        .map((p) => [dist(p, v), p] as [number, number[]])
        .sort((a, b) => a[0] - b[0]);

    return point(sorted[0][1][0], sorted[0][1][1]);
}

export function applyPhysics(
    time: number,
    scene: Scene<unknown>,
    engine: Engine<unknown>
) {
    const { gl } = engine;
    if (!gl) return;

    const screenHeight = SCREEN_HEIGHT;

    const collidables: Entity[] = (scene.objects as Entity[]).filter(
        (obj) => (obj as Entity).collidable
    );

    for (const obj of scene.objects) {
        const entity = obj as Entity;
        const vx = entity.physics.vx;
        const vy = entity.physics.vy;
        let [updatedVx, updatedVy] = calculateVelocity(vx, vy);
        const bbox = entity.getBbox();

        if (entity.applyPhysics) {
            // Find all lines in the scene, and calculate intercepts

            const velocity = convertToInterceptFormula(
                makeLine(
                    bbox.x + bbox.w / 2,
                    bbox.y + bbox.h / 2,
                    bbox.x + bbox.w / 2 + updatedVx,
                    bbox.y + bbox.h / 2 - updatedVy
                )
            );

            const lines = collidables
                .filter((obj) => colliding(entity, obj))
                .flatMap((obj) => obj.getLines());

            // Do collision gud
            for (const line of lines) {
                const intercept = lineIntersection(
                    velocity,
                    convertToInterceptFormula(line)
                );

                if (
                    intercept &&
                    segmentsIntersect(
                        velocity.meta.p1,
                        velocity.meta.p2,
                        line.p1,
                        line.p2
                    )
                ) {
                    // Calculate the intercept vector
                    const vec = [updatedVx, updatedVy];

                    // Calculate the vector of the surface
                    const surface_vec = [
                        line.p2.x - line.p1.x,
                        line.p2.y - line.p1.y,
                    ];

                    const surface_mag = Math.hypot(
                        surface_vec[0],
                        surface_vec[1]
                    );

                    const surface_normal = [
                        -surface_vec[1] / surface_mag,
                        surface_vec[0] / surface_mag,
                    ];

                    const velAlongNormal = m3.dot(vec, surface_normal);
                    if (velAlongNormal > 0) {
                        continue;
                    }

                    const impulse = [
                        -surface_normal[0] * velAlongNormal,
                        -surface_normal[1] * velAlongNormal,
                    ];

                    // entity.physics.vy = impulse[1] != 0 ? 0 : entity.physics.vy;

                    // console.log(impulse[1], {
                    //     vx,
                    //     vy,
                    //     updatedVx,
                    //     updatedVy,
                    //     velocity,
                    //     edge,
                    //     bbox,
                    //     vec,
                    //     surface_normal,
                    //     intercept,
                    //     velAlongNormal,
                    //     impulse,
                    // });

                    updatedVx += impulse[0];
                    updatedVy += impulse[1];
                }
            }
            // Do collision
            // TODO: This is not going to work for walls
            // const activeCollisions = collidables
            //     .filter((x) => x != entity)
            //     .filter(
            //         (x) =>
            //             entity.physics.vy < 0 && colliding(entity, x as Entity)
            //     );

            // activeCollisions.sort((a, b) => dist(b as Entity, a as Entity));

            // const collidedWith = activeCollisions[0];
            // const h = Math.abs(entity.getBbox().h ?? 0);

            // if (collidedWith && entity._bbox && collidedWith._bbox) {
            //     entity.physics.vy = 0;
            //     entity.physics.accelerationY = 1;
            //     entity.position[1] =
            //         collidedWith.position[1] -
            //         collidedWith._bbox?.w / 2 -
            //         entity._bbox?.w / 2;
            // } else if (entity.position[1] > screenHeight - h / 2) {
            //     entity.position[1] = screenHeight - h / 2;
            //     entity.physics.vy = 0;
            //     entity.physics.accelerationY = 1;
            // } else {
            //     // Do the physics
            // }

            entity.position[0] += updatedVx;
            entity.position[1] -= updatedVy;

            entity.physics.vx = updatedVx;
            entity.physics.vy = updatedVy;

            engine.debug(`vx: ${r(updatedVx)}`);
            engine.debug(`vy: ${r(updatedVy)}`);
            // const nextPhysics = getUpdatedPhysicsAttributes(entity, time);
            // entity.physics = { ...nextPhysics };
        }
    }
}

function calculateVelocity(vx: number, vy: number): [number, number] {
    let nextVx = vx;
    let nextVy = vy;

    if (nextVx > 0) {
        nextVx -= FRICTION;
        if (nextVx <= FRICTION) {
            nextVx = 0;
        }
    } else {
        nextVx += FRICTION;
        if (nextVx >= FRICTION) {
            nextVx = 0;
        }
    }

    let accel = G;
    const frac = (0.05 + Math.abs(nextVy / MAX_VEL_Y)) * 40;

    if (frac > 0.25) accel *= frac;

    // @ts-ignore
    window['gameEngine'].debug(`frac ${r(frac)}`);

    if (nextVy > -MAX_VEL_Y) {
        nextVy -= accel;
    } else if (nextVy < 0) {
        nextVy += accel;
    }

    return [nextVx, nextVy];
}

function getUpdatedPhysicsAttributes(entity: Entity, time: number) {
    const phys = entity.physics;
    const nextAccelerationY = phys.accelerationY; // * 1.09;
    let nextTargetVx = phys.targetVx * DECAY;
    let nextVy = phys.vy - 0.25 * nextAccelerationY; //* (time / FPS);
    let nextMovementDuration = phys.movementDuration;
    let nextVx = phys.vx;

    // Add some friction
    /*
                Basic formula:
                    - targetVx wants to go to zero.
                    - vx wants to go to targetVx.
            */
    if (phys.vx < nextTargetVx) {
        nextVx += FRICTION;
    } else if (phys.vx > nextTargetVx) {
        nextVx -= FRICTION;
    }

    // Sneaky friction
    if (Math.hypot(nextVx - nextTargetVx) < THRESHOLD) {
        nextMovementDuration += time;
        nextVx += (-Math.sign(nextVx) * FRICTION) / 2.25;
    } else {
        nextMovementDuration = 0;
    }

    if (nextMovementDuration > 10.0) {
        nextVx = 0;
    }

    if (nextTargetVx > THRESHOLD) {
        nextTargetVx -= ACCELERATION;
    } else if (nextTargetVx < -THRESHOLD) {
        nextTargetVx += ACCELERATION;
    } else {
        nextTargetVx = 0;
    }

    // Cap the maximum velocities
    nextVy = Math.min(Math.max(nextVy, -MAX_VEL_Y), MAX_VEL_Y);
    nextVx = Math.min(Math.max(nextVx, -MAX_VEL_X), MAX_VEL_X);

    return {
        accelerationY: 1,
        movementDuration: nextMovementDuration,
        targetVx: nextTargetVx,
        vx: nextVx,
        vy: nextVy,
    };
}
