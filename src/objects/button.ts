import { rect2D, Flatten, Repeat, zeros, rads } from 'webgl-engine';
import { Entity } from './entity';

export function spawnButton(x: number, y: number, onHit?: () => void): Entity {
    let hit = false;
    const w = 15,
        h = 15;
    const button = new Entity({
        name: `button_${x}_${y}`,
        applyPhysics: false,
        collidable: true,
        vertexes: rect2D(w, h),
        colors: Flatten([Repeat([204, 255, 0], 6)]),
        offsets: [-w / 2, -h / 2, 0],
        position: [x, y, 0],
        rotation: zeros(),
        update: function (time, engine) {
            if (!hit && button.beam.hit) {
                hit = true;
                onHit && onHit();
            }

            if (hit) {
                this.colors = Flatten(Repeat([255, 255, 255], 6));
            } else {
                this.colors = Flatten(Repeat([255, 0, 255], 6));
            }

            engine.activeScene.updateObject(this);
        },
    });

    return button;
}
