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
    };
};

export type Rect = {
    x: number;
    y: number;
    w: number;
    h: number;
};

function round(v: number) {
    return Math.round(v * 1000) / 1000;
}

export function point(x: number, y: number) {
    return { x, y };
}

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
            x: x1,
            y: y1,
        },
        p2: {
            x: x2,
            y: y2,
        },
    };
}

export function convertToInterceptFormula(line: Line): LineInterceptFormula {
    const vertical = line.p2.x === line.p1.x;

    // Normal parameters
    const m = (line.p2.y - line.p1.y) / (line.p2.x - line.p1.x);
    const b = line.p1.y - m * line.p1.x;

    // Vertical parameters
    const vM = 0;
    const vB = line.p1.x;

    return {
        m,
        b,
        vM,
        vB,
        meta: {
            type: vertical ? 'vertical' : 'normal',
            p1: line.p1,
            p2: line.p2,
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
        x: round(xIntercept),
        y: round(yIntercept),
    };
}
