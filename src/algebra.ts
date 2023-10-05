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
};

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
    const m = (line.p2.y - line.p1.y) / (line.p2.x - line.p1.x);
    return {
        m,
        b: line.p1.y - m * line.p1.x,
    };
}

export function lineIntersection(
    line1: LineInterceptFormula,
    line2: LineInterceptFormula
): Point {
    const xIntercept = (line2.b - line1.b) / (line1.m - line2.m);
    const yIntercept = line1.m * xIntercept + line1.b;
    return {
        x: xIntercept,
        y: yIntercept,
    };
}
