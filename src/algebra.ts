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

export function fixRect(rect: Rect) {
    const x1 = Math.min(rect.x, rect.x + rect.w);
    const x2 = Math.max(rect.x, rect.x + rect.w);
    const y1 = Math.min(rect.y, rect.y + rect.h);
    const y2 = Math.max(rect.y, rect.y + rect.h);

    return {
        x: round(x1),
        y: round(y1),
        w: round(x2 - x1),
        h: round(y2 - y1),
    };
}

export function pointInRect(p: Point, rect: Rect): boolean {
    rect = fixRect(rect);

    return (
        p.x >= rect.x &&
        p.x <= rect.x + rect.w &&
        p.y >= rect.y - rect.h &&
        p.y <= rect.y
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
    if (vertical) {
        const m = (line.p2.x - line.p1.x) / (line.p2.y - line.p1.y);
        return {
            m,
            b: line.p1.x - m * line.p1.y,
            meta: {
                type: 'vertical',
                p1: line.p1,
                p2: line.p2,
            },
        };
    } else {
        const m = (line.p2.y - line.p1.y) / (line.p2.x - line.p1.x);
        return {
            m,
            b: line.p1.y - m * line.p1.x,
            meta: {
                type: 'normal',
                p1: line.p1,
                p2: line.p2,
            },
        };
    }
}

export function lineIntersection(
    line1: LineInterceptFormula,
    line2: LineInterceptFormula
): Point | undefined {
    const xIntercept = (line2.b - line1.b) / (line1.m - line2.m);
    const yIntercept = line1.m * xIntercept + line1.b;

    if (isNaN(xIntercept) || isNaN(yIntercept)) {
        return undefined;
    }

    if (line2.meta.type === 'vertical') {
        return {
            x: round(yIntercept),
            y: round(xIntercept),
        };
    } else {
        return {
            x: round(xIntercept),
            y: round(yIntercept),
        };
    }
}
