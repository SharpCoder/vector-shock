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
export const MAX_VEL_X = 6;

export const IMPULSE_VEL_X = 6;
export const IMPULSE_VEL_Y = 45;

const ACCELERATION = 3.0;
const FRICTION = 0.45;
const G = 0.3;
const THRESHOLD = FRICTION;
const DECAY = 0.25;

let disabled = false;

export function applyPhysics(scene: Scene<unknown>, engine: Engine<unknown>) {
    const { gl } = engine;
    if (!gl) return;

    const collidables: Entity[] = (scene.objects as Entity[]).filter(
        (obj) => (obj as Entity).collidable
    );

    for (const obj of scene.objects) {
        const entity = obj as Entity;
        const vx = entity.physics.vx;
        const vy = entity.physics.vy;
        let [updatedVx, updatedVy] = calculateVelocity(vx, vy);
        const bbox = entity.getBbox();

        if (engine.mousebutton != 0) disabled = false;

        if (disabled) continue;

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

                        // entity.physics.vy = impulse[1] != 0 ? 0 : entity.physics.vy;

                        updatedVx = r(updatedVx) + r(impulse[0]);
                        updatedVy = r(updatedVy) + r(impulse[1]);

                        // Positional correction
                        if (lineIntercept.meta.normal[0] > 0) {
                            entity.position[0] += bbox.x - intercept.x;
                        } else if (lineIntercept.meta.normal[0] < 0) {
                            entity.position[0] += bbox.x - intercept.x + bbox.w;
                        }

                        if (lineIntercept.meta.normal[1]) {
                            entity.position[1] -= bbox.y - intercept.y + bbox.h;
                        }
                    }
                }
            }

            entity.position[0] += updatedVx;
            entity.position[1] -= updatedVy;

            entity.physics.vx = updatedVx;
            entity.physics.vy = updatedVy;
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
