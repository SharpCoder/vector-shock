import { rect2D, Flatten, Repeat, zeros } from 'webgl-engine';
import { Entity } from './entity';
import { INFINITY, getScreenScale, type ScriptFn } from '../constants';
import {
    convertToInterceptFormula,
    lineIntersection,
    makeLine,
    pointInRect,
} from '../algebra';

export function spawnRay(theta: number, scripts: ScriptFn[]): [Entity, Entity] {
    const thickness = 2;

    // The ray is technically projected until infinity,
    // or if it hits a wall
    const track = new Entity({
        name: `tracking_${20}_${20}`,
        applyPhysics: false,
        collidable: false,
        vertexes: rect2D(10, 10),
        zIndex: 2,
        colors: Flatten([Repeat([255, 255, 255], 6)]),
        offsets: [-10 / 2, -10 / 2, 0],
        position: zeros(),
        rotation: zeros(),
        visible: true,
    });

    const ray = new Entity({
        name: 'ray',
        applyPhysics: false,
        collidable: false,
        computeBbox: true,
        vertexes: rect2D(INFINITY, thickness),
        colors: Flatten([Repeat([255, 0, 255], 6)]),
        offsets: [0, -thickness / 2, 0],
        position: [0, 0, 0],
        rotation: [-theta, 0, 0],
        zIndex: -1,
        update: function (time, engine) {
            if (scripts) {
                for (const script of scripts) {
                    script.call(ray, time, engine);
                }
            }

            const { gl, activeScene } = engine;

            if (!gl) return;
            if (!this._parent) return;
            if (this.visible === false) return;

            const [scaleX, scaleY] = getScreenScale(gl);

            // Center the ray on the parent object
            const parent = this._parent as Entity;
            this.position[0] = -(parent.offsets[0] ?? 0);
            this.position[1] = parent.offsets[1] ?? 0;

            // Calculate theta based on mouse
            const mx = engine.mouseOffsetX * scaleX,
                my = engine.mouseOffsetY * scaleY;

            const bbox = parent.getBbox();
            const ox = bbox.x + bbox.w / 2;
            const oy = bbox.y - bbox.h / 2;

            let dist = INFINITY;

            // Find the intersection point between everything
            const rayLine = convertToInterceptFormula(makeLine(ox, oy, mx, my));

            for (const obj of activeScene.objects) {
                if (obj === this) continue;
                if (obj === this._parent) continue;

                const otherBbox = (obj as Entity).getBbox();
                const otherLine = (obj as Entity).getLine();

                // Fix it
                otherLine.p2.y = otherLine.p1.y;

                const otherLineInterceptFormat =
                    convertToInterceptFormula(otherLine);

                const intercept = lineIntersection(
                    rayLine,
                    otherLineInterceptFormat
                );

                if (
                    intercept &&
                    pointInRect(intercept, otherBbox) &&
                    Math.sign(my - oy) === Math.sign(intercept.y - oy)
                ) {
                    track.position[0] = intercept?.x ?? 0;
                    track.position[1] = intercept?.y ?? 0;
                    dist = Math.min(
                        dist,
                        Math.sqrt(
                            Math.pow(intercept.x - ox, 2) +
                                Math.pow(intercept.y - oy, 2)
                        )
                    );
                }
            }

            this.vertexes = rect2D(dist, thickness);
            engine.activeScene.updateObject(this);

            this.rotation[0] = Math.atan2(my - oy, mx - ox);
        },
    });

    return [ray, track];
}
