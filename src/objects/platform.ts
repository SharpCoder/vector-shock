import { rect2D, Flatten, Repeat, zeros, rads } from 'webgl-engine';
import { Entity } from './entity';
import { processJump } from '../scripts/keyboard';

export function spawnPlatform(
    x: number,
    y: number,
    w: number,
    h: number
): Entity {
    let counter = 0;
    let v = 1;

    const platform = new Entity({
        name: `platform_${x}_${y}_${w}_${h}`,
        applyPhysics: false,
        collidable: true,
        reflective: false,
        vertexes: rect2D(w, h),
        colors: Flatten(Repeat([0, 0, 0], 6)),
        offsets: [-w / 2, -h / 2, 0],
        position: [x, y, 0],
        rotation: zeros(),
        properties: {
            activated: undefined,
        },
        surfaces: ['north', 'south', 'center_horizontal'],
        update: function (time, engine) {
            if (this.beam.hit) {
                this.colors = Flatten(Repeat([255, 255, 255], 6));
            } else {
                this.colors = Flatten(Repeat([255, 0, 255], 6));
            }

            engine.activeScene.updateObject(this);

            if (this.properties?.activated) {
                counter += v;
                if (counter === 100 || counter === 0) {
                    v *= -1;
                }

                const t = Math.sin((counter / 100.0) * 2 * Math.PI);

                this.physics.vy -= t / 10;
                this.physics.vx -= t / 10;
                // this.position[1] =
                //     y +
                //     150 *
                //         Math.sin(
                //             ((new Date().getTime() -
                //                 this.properties.activated) /
                //                 1000.0) %
                //                 (2 * Math.PI)
                //         );
            }
        },
    });

    return platform;
}
