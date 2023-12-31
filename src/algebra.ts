import { fly } from 'svelte/transition';
import { r } from 'webgl-engine';

export type Point = {
    x: number;
    y: number;
};

export type Line = {
    p1: Point;
    p2: Point;
};

export type LineInterceptFormula = {
    m: number;
    b: number;
    vM: number;
    vB: number;
    meta: {
        type: 'vertical' | 'normal';
        p1: Point;
        p2: Point;
        normal: number[];
    };
};

export type Rect = {
    x: number;
    y: number;
    w: number;
    h: number;
};

export function lpf(old: number, updated: number, perc: number) {
    perc = Math.min(Math.max(perc, 0), 1);
    console.log(old, updated, perc, old * (1.0 - perc) + updated * perc);
    return old * (1.0 - perc) + updated * perc;
}

export function point(x: number, y: number) {
    return { x: r(x), y: r(y) };
}

/**
 * LINE INTERSECTION STUFF
 */

function cross(p1: Point, p2: Point) {
    return p1.x * p2.y - p2.x * p1.y;
}

function direction(p1: Point, p2: Point, p3: Point) {
    return cross(
        point(p3.x - p1.x, p3.y - p1.y),
        point(p2.x - p1.x, p2.y - p1.y)
    );
}
function onSegment(p1: Point, p2: Point, p3: Point) {
    const minX = Math.min(p1.x, p2.x);
    const minY = Math.min(p1.y, p2.y);
    const maxX = Math.max(p1.x, p2.x);
    const maxY = Math.max(p1.y, p2.y);

    return minX <= p3.x && p3.x <= maxX && minY <= p3.y && p3.y <= maxY;
}

export function segmentsIntersect(
    p1: Point,
    p2: Point,
    p3: Point,
    p4: Point
): boolean {
    const d1 = direction(p3, p4, p1);
    const d2 = direction(p3, p4, p2);
    const d3 = direction(p1, p2, p3);
    const d4 = direction(p1, p2, p4);

    if (
        ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
        ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
    ) {
        return true;
    } else if (d1 == 0 && onSegment(p3, p4, p1)) {
        return true;
    } else if (d2 == 0 && onSegment(p3, p4, p2)) {
        return true;
    } else if (d3 == 0 && onSegment(p1, p2, p3)) {
        return true;
    } else if (d4 == 0 && onSegment(p1, p2, p4)) {
        return true;
    } else {
        return false;
    }
}

/**
 * Sources
 * https://algorithmtutor.com/Computational-Geometry/Determining-if-two-consecutive-segments-turn-left-or-right/
 * https://algorithmtutor.com/Computational-Geometry/Check-if-two-line-segment-intersect/
 */

export function pointInRect(p: Point, rect: Rect): boolean {
    return (
        p.x >= rect.x &&
        p.x <= rect.x + rect.w &&
        p.y >= rect.y &&
        p.y <= rect.y + rect.h
    );
}

export function makeLine(x1: number, y1: number, x2: number, y2: number): Line {
    return {
        p1: {
            x: r(x1),
            y: r(y1),
        },
        p2: {
            x: r(x2),
            y: r(y2),
        },
    };
}

export function convertToInterceptFormula(line: Line): LineInterceptFormula {
    const vertical = line.p2.x === line.p1.x;

    // Normal parameters
    const m = (line.p2.y - line.p1.y) / (line.p2.x - line.p1.x);
    const b = line.p1.y - m * line.p1.x;

    // Vertical parameters (only applicable if the two points in the line are not the same)
    const vM = line.p1.y != line.p2.y ? 0 : NaN;
    const vB = line.p1.y != line.p2.y ? line.p2.x : NaN;

    // Calculate the normal
    const n_vec = [line.p2.x - line.p1.x, line.p2.y - line.p1.y];
    const n_mag = Math.hypot(n_vec[0], n_vec[1]);
    const normal = [-r(n_vec[1] / n_mag), r(n_vec[0] / n_mag)];

    return {
        m: r(m),
        b: r(b),
        vM: r(vM),
        vB: r(vB),
        meta: {
            type: vertical ? 'vertical' : 'normal',
            p1: line.p1,
            p2: line.p2,
            normal,
        },
    };
}

export function lineIntersection(
    line1: LineInterceptFormula,
    line2: LineInterceptFormula
): Point | undefined {
    let xIntercept = NaN;
    let yIntercept = NaN;

    if (line1.meta.type === 'vertical' && line2.meta.type === 'normal') {
        xIntercept = line1.vB;
        yIntercept = line2.m * xIntercept + line2.b;
    } else if (line1.meta.type === 'normal' && line2.meta.type === 'vertical') {
        xIntercept = line2.vB;
        yIntercept = line1.m * xIntercept + line1.b;
    } else if (
        line1.meta.type === 'vertical' &&
        line2.meta.type === 'vertical'
    ) {
        xIntercept = line1.vB === line2.vB ? line1.vB : NaN;
        yIntercept = line1.meta.p1.y;
    } else {
        xIntercept = (line2.b - line1.b) / (line1.m - line2.m);
        yIntercept = line1.m * xIntercept + line1.b;
    }

    if (isNaN(xIntercept) || isNaN(yIntercept)) {
        return undefined;
    }

    return {
        x: r(xIntercept),
        y: r(yIntercept),
    };
}
