// Not real ray-tracing, I just like the name

import {
    Flatten,
    type Engine,
    type Scene,
    Repeat,
    zeros,
    rect2D,
    m3,
    rads,
} from 'webgl-engine';
import { Entity } from '../objects/entity';
import { INFINITY, SCREEN_HEIGHT, getScreenScale } from '../constants';
import {
    convertToInterceptFormula,
    lineIntersection,
    makeLine,
    pointInRect,
    type Point,
} from '../algebra';

const RAY_ENTITIES: Record<number, Entity> = {};
const RAY_THICKNESS = 2;

// The responsibility of this script is to render one or more rays to the map based on
// the angle which the player is aiming, and whether the raytracing button is actively
// engaged. This method will establish a ray and then reflect it based on reflective
// surfaces that are encountered along the way.
export function applyRayTracing(
    player: Entity,
    scene: Scene<unknown>,
    engine: Engine<unknown>
) {
    // Reset all the rays
    for (const obj of Object.values(RAY_ENTITIES)) {
        obj.visible = false;
    }

    const { gl } = engine;
    if (!gl) return;
    if (engine.keymap['shift'] !== true) {
        return;
    }

    // Bunch o constants
    const [scaleX, scaleY] = getScreenScale(gl);
    const bbox = player.getBbox();
    let ox = bbox.x + bbox.w / 2;
    let oy = bbox.y - bbox.h / 2;
    let targetX = engine.mouseOffsetX * scaleX;
    let targetY = engine.mouseOffsetY * scaleY;

    // Calculate the dist of the ray
    const rays = [];

    // Add the first ray to the list
    rays.push(convertToInterceptFormula(makeLine(ox, oy, targetX, targetY)));

    let rayIndex = 0;
    while (rays.length > 0 && rayIndex < 10) {
        const ray = rays.pop();
        if (ray) {
            if (RAY_ENTITIES[rayIndex] === undefined) {
                RAY_ENTITIES[rayIndex] = createLine(rayIndex);
            }

            // Create a vertical ray also, for some code paths
            const verticalRay = convertToInterceptFormula(
                makeLine(
                    ray.meta.p1.y,
                    ray.meta.p1.x,
                    ray.meta.p2.y,
                    ray.meta.p2.x
                )
            );

            // Update the vertexes and positions of the object
            let dist = INFINITY;
            let hitEntity = undefined;
            let finalIntercept = undefined;
            let finalLine = undefined;

            const rayEntity = RAY_ENTITIES[rayIndex];

            for (const obj of scene.objects as Entity[]) {
                if (obj === rayEntity) continue;
                if (obj === player) continue;

                const objLines = obj.getLines();
                // Calculate the ray against each line segment that comprises this entity.
                for (const line of objLines) {
                    const objLine = convertToInterceptFormula(line);
                    const intercept: Point | undefined =
                        objLine.meta.type === 'normal'
                            ? lineIntersection(ray, objLine)
                            : lineIntersection(verticalRay, objLine);

                    if (
                        intercept &&
                        pointInRect(intercept, obj.getBbox()) &&
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

            // If the target that was hit is reflective, duplciate the ray!
            if (hitEntity && finalIntercept && finalLine) {
                const vert = finalLine.meta.type === 'vertical';
                const mat = m3.combine([
                    m3.translate(ox, oy),
                    m3.rotate(vert ? rads(180) : 0),
                    m3.translate(ox, oy),
                ]);

                const a = Math.max(ox, finalIntercept.x);
                const b = Math.min(ox, finalIntercept.x);
                const c = Math.max(oy, finalIntercept.y);
                const d = Math.min(oy, finalIntercept.y);

                const sign = vert ? -1 : 1;
                targetX =
                    finalIntercept.x - sign * Math.sign(ray.m) * (a - b) * 4;

                targetY = finalIntercept.y + sign * (c - d) * 4;
                ox = finalIntercept.x;
                oy = finalIntercept.y;

                rays.push(
                    convertToInterceptFormula(
                        makeLine(finalIntercept.x, oy, targetX, oy)
                    )
                );
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
        vertexes: rect2D(1, 1),
        colors: Flatten(Repeat([255, 0, 255], 6)),
        offsets: [0, -RAY_THICKNESS / 2, 0],
        position: zeros(),
        rotation: zeros(),
        index: -1,
    });
}
