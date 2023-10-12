// Not real ray-tracing, I just like the name

import {
    Flatten,
    type Engine,
    type Scene,
    Repeat,
    zeros,
    rect2D,
    degs,
    m3,
} from 'webgl-engine';
import { Entity } from '../objects/entity';
import { INFINITY, getScreenScale } from '../constants';
import {
    convertToInterceptFormula,
    lineIntersection,
    makeLine,
    pointInRect,
    type Point,
    type LineInterceptFormula,
} from '../algebra';

const RAY_ENTITIES: Record<number, Entity> = {};
const RAY_THICKNESS = 3;
const MAX_RAYS = 2;

// The responsibility of this script is to render one or more rays to the map based on
// the angle which the player is aiming, and whether the raytracing button is actively
// engaged. This method will establish a ray and then reflect it based on reflective
// surfaces that are encountered along the way.
export function applyRayCasting(
    player: Entity,
    scene: Scene<unknown>,
    engine: Engine<unknown>
) {
    // Reset all the rays
    for (const obj of Object.values(RAY_ENTITIES)) {
        obj.visible = false;
    }

    for (const obj of scene.objects) {
        const entity = obj as Entity;
        if (entity.beam) {
            entity.beam.hit = false;
        }
    }

    const { gl } = engine;
    const { camera } = scene;
    if (!gl) return;
    if (engine.mousebutton != 1) return;
    // if (engine.keymap['shift'] !== true) {
    //     return;
    // }

    // Bunch o constants
    const [scaleX, scaleY] = getScreenScale(gl);
    const bbox = player.getBbox();
    let ox = bbox.x + bbox.w / 2;
    let oy = bbox.y + bbox.h / 2;
    let targetX = camera.position[0] + engine.mouseOffsetX * scaleX;
    let targetY = camera.position[1] + engine.mouseOffsetY * scaleY;

    // Calculate the dist of the ray
    const rays: LineInterceptFormula[] = [];

    // Add the first ray to the list
    rays.push(convertToInterceptFormula(makeLine(ox, oy, targetX, targetY)));

    let rayIndex = 0;
    while (rays.length > 0 && rayIndex < MAX_RAYS) {
        const ray = rays.pop();
        if (ray) {
            if (RAY_ENTITIES[rayIndex] === undefined) {
                RAY_ENTITIES[rayIndex] = createLine(rayIndex);
            }

            // Update the vertexes and positions of the object
            let dist = INFINITY;
            let hitEntity = undefined;
            let finalIntercept = undefined;
            let finalLine = undefined;

            const rayEntity = RAY_ENTITIES[rayIndex];

            for (const obj of scene.objects as Entity[]) {
                if (obj === rayEntity) continue;
                if (obj === player) continue;
                if (!obj.collidable) continue;

                const objLines = obj.getLines();
                // Calculate the ray against each line segment that comprises this entity.
                for (const line of objLines) {
                    const objLine = convertToInterceptFormula(line);
                    const intercept: Point | undefined = lineIntersection(
                        ray,
                        objLine
                    );

                    const rayVec = [
                        ray.meta.p2.x - ray.meta.p1.x,
                        ray.meta.p1.y - ray.meta.p2.y,
                    ];

                    const velAlongNormal = m3.dot(rayVec, objLine.meta.normal);
                    const expandedBbox = obj.getBbox();

                    expandedBbox.h += Math.abs(obj.physics.vy);

                    if (
                        intercept &&
                        velAlongNormal <= 0 &&
                        pointInRect(intercept, expandedBbox) &&
                        Math.sign(targetY - oy) === Math.sign(intercept.y - oy)
                    ) {
                        const nextDist = Math.min(
                            dist,
                            Math.hypot(intercept.x - ox, intercept.y - oy)
                        );

                        if (nextDist < dist) {
                            dist = nextDist;
                            hitEntity = obj;
                            finalIntercept = intercept;
                            finalLine = objLine;
                        }
                    }
                }
            }

            // Update relevant properties.
            rayEntity.vertexes = rect2D(dist, RAY_THICKNESS);
            rayEntity.position = [ox, oy, 0];
            rayEntity.rotation[0] = Math.atan2(targetY - oy, targetX - ox);
            rayEntity.visible = true;

            if (hitEntity) {
                hitEntity.beam.hit = true;
            }

            // If the target that was hit is reflective, duplciate the ray!
            if (
                hitEntity &&
                finalIntercept &&
                finalLine &&
                hitEntity.reflective
            ) {
                const vert = finalLine.meta.type === 'vertical';
                const a = Math.max(ox, finalIntercept.x);
                const b = Math.min(ox, finalIntercept.x);
                const c = Math.max(oy, finalIntercept.y);
                const d = Math.min(oy, finalIntercept.y);

                const sign = vert ? -1 : 1;

                if (targetY > oy) {
                    targetX =
                        finalIntercept.x +
                        sign * Math.sign(ray.m) * (a - b) * 4;
                    targetY = finalIntercept.y - sign * (c - d) * 4;
                } else {
                    targetX =
                        finalIntercept.x -
                        sign * Math.sign(ray.m) * (a - b) * 4;
                    targetY = finalIntercept.y + sign * (c - d) * 4;
                }

                ox = finalIntercept.x;
                oy = finalIntercept.y;
                const resultRay = convertToInterceptFormula(
                    makeLine(ox, oy, targetX, targetY)
                );

                const mag = Math.hypot(finalIntercept.x, finalIntercept.y);

                rays.push(resultRay);
            }
            scene.updateObject(rayEntity);
            rayIndex += 1;
        }
    }
}

function createLine(index: number): Entity {
    return new Entity({
        name: `ray_${index}`,
        applyPhysics: false,
        collidable: false,
        computeBbox: false,
        hidden: true,
        vertexes: rect2D(1, 1),
        colors: Flatten(Repeat([255, 0, 255], 6)),
        offsets: [0, -RAY_THICKNESS / 2, 0],
        position: zeros(),
        rotation: zeros(),
        index: -1,
    });
}
