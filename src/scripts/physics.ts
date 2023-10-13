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
    lpf,
} from '../algebra';

export const MAX_VEL_Y = 100;
export const MAX_VEL_X = 6;

export const IMPULSE_VEL_X = 6;
export const IMPULSE_VEL_Y = 45;

const FRICTION = 0.45;
const G = 0.3;

let dilationTime: number | undefined = undefined;

export function applyPhysics(scene: Scene<unknown>, engine: Engine<unknown>) {
    const { gl } = engine;
    if (!gl) return;

    if (!engine.keymap['shift']) {
        dilationTime = undefined;
    } else {
        dilationTime = dilationTime ?? new Date().getTime();
    }

    let timeDilation = 1;
    if (dilationTime) {
        timeDilation = lpf(
            0.01,
            1.0,
            (new Date().getTime() - dilationTime) / 4000
        );
    }

    const collidables: Entity[] = (scene.objects as Entity[]).filter(
        (obj) => (obj as Entity).collidable && obj.visible !== false
    );

    for (const obj of scene.objects) {
        const entity = obj as Entity;
        const vx = entity.physics.vx;
        const vy = entity.physics.vy;
        let [updatedVx, updatedVy] = calculateVelocity(vx, vy);
        const bbox = entity.getBbox();

        if (entity.applyPhysics) {
            const velocity = convertToInterceptFormula(
                makeLine(bbox.x, bbox.y, bbox.x + updatedVx, bbox.y - updatedVy)
            );

            // Do collision gud
            for (const obj of collidables) {
                for (const line of obj.getLines()) {
                    const lineIntercept = convertToInterceptFormula(line);
                    const intercept = lineIntersection(velocity, lineIntercept);

                    if (
                        intercept &&
                        (segmentsIntersect(
                            point(bbox.x, bbox.y),
                            point(bbox.x, bbox.y + bbox.h - updatedVy),
                            line.p1,
                            line.p2
                        ) ||
                            segmentsIntersect(
                                point(bbox.x + bbox.w, bbox.y),
                                point(
                                    bbox.x + bbox.w,
                                    bbox.y + bbox.h - updatedVy
                                ),
                                line.p1,
                                line.p2
                            ) ||
                            segmentsIntersect(
                                point(bbox.x, bbox.y),
                                point(
                                    bbox.x + bbox.w + updatedVx,
                                    bbox.y + bbox.h
                                ),
                                line.p1,
                                line.p2
                            ) ||
                            segmentsIntersect(
                                point(bbox.x - Math.abs(updatedVx), bbox.y),
                                point(
                                    bbox.x - Math.abs(updatedVx) + bbox.w,
                                    bbox.y + bbox.h
                                ),
                                line.p1,
                                line.p2
                            ))
                    ) {
                        // Calculate the intercept vector
                        const vec = [updatedVx, updatedVy];

                        // Calculate the vector of the surface
                        const velAlongNormal = m3.dot(
                            vec,
                            lineIntercept.meta.normal
                        );
                        if (velAlongNormal > 0) {
                            continue;
                        }

                        const impulse = [
                            -lineIntercept.meta.normal[0] * velAlongNormal,
                            -lineIntercept.meta.normal[1] * velAlongNormal,
                        ];

                        updatedVx = r(updatedVx) + r(impulse[0]);

                        // Positional correction
                        if (lineIntercept.meta.normal[0] > 0) {
                            entity.position[0] += bbox.x - intercept.x;
                        } else if (lineIntercept.meta.normal[0] < 0) {
                            entity.position[0] += bbox.x - intercept.x + bbox.w;
                        }

                        // Only apply y-axis position correction if we are falling and the normals align.
                        if (lineIntercept.meta.normal[1] && vy < 0) {
                            updatedVy = r(updatedVy) + r(impulse[1]);
                            entity.position[1] -= bbox.y - intercept.y + bbox.h;
                        }

                        // If the collision entity is moving, keep us with it.
                        entity.position[0] += obj.physics.vx;
                        entity.position[1] -= obj.physics.vy;
                    }
                }
            }

            // updatedVx *= timeDilation;
            // updatedVy *= timeDilation;

            entity.position[0] += updatedVx * timeDilation;
            entity.position[1] -= updatedVy * timeDilation;

            // Calculate new velocity vectors
            entity.physics.vx = vx + (updatedVx - vx) * timeDilation;
            entity.physics.vy = vy + (updatedVy - vy) * timeDilation;
        } else {
            entity.position[0] += vx * timeDilation;
            entity.position[1] -= vy * timeDilation;
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

    if (nextVy > -MAX_VEL_Y) {
        nextVy -= accel;
    } else if (nextVy < 0) {
        nextVy += accel;
    }

    return [nextVx, nextVy];
}
