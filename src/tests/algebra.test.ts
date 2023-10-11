import { expect, test } from 'vitest';
import {
    convertToInterceptFormula,
    makeLine,
    type LineInterceptFormula,
    lineIntersection,
    type Line,
    type Point,
} from '../algebra';

const BLANK_META = {
    type: 'normal',
    p1: {
        x: 0,
        y: 0,
    },
    p2: {
        x: 0,
        y: 0,
    },
} as {
    type: 'normal' | 'vertical';
    p1: Point;
    p2: Point;
};

test('Algebra - Line Slop Formula', () => {
    const line = makeLine(3, 3, 4, 1);
    const formula = convertToInterceptFormula(line);
    expect(formula.m).toBe(-2);
    expect(formula.b).toBe(9);

    const line2 = makeLine(1, -2, 6, 5);
    const formula2 = convertToInterceptFormula(line2);
    expect(formula2.m).toBe(7 / 5);
    expect(formula2.b).toBe(-17 / 5);
});

test('Algebra - Intercept', () => {
    const line1: LineInterceptFormula = {
        m: 2,
        b: 3,
        vM: NaN,
        vB: NaN,
        meta: BLANK_META,
    };

    const line2: LineInterceptFormula = {
        m: -0.5,
        b: 7,
        vM: NaN,
        vB: NaN,
        meta: BLANK_META,
    };

    const intercept = lineIntersection(line1, line2);
    expect(intercept).toBeDefined();
    if (intercept) {
        expect(intercept.x).toBe(1.6);
        expect(intercept.y).toBe(6.2);
    }
});

test('Algebra - Horizontal Intercept', () => {
    const line1: LineInterceptFormula = {
        m: 1,
        b: 0,
        vM: NaN,
        vB: NaN,
        meta: BLANK_META,
    };

    const line2: LineInterceptFormula = {
        m: 0,
        b: 600,
        vM: NaN,
        vB: NaN,
        meta: BLANK_META,
    };

    const intercept = lineIntersection(line1, line2);
    expect(intercept).toBeDefined();
    if (intercept) {
        expect(intercept.x).toBe(600);
        expect(intercept.y).toBe(600);
    }
});

test('Algebra - Vertical Intercept (1 line) Intercepting', () => {
    const line1 = convertToInterceptFormula(makeLine(1, 1, 1, 100));
    const line2 = convertToInterceptFormula(makeLine(0, 55, 100, 55));

    const intercept = lineIntersection(line1, line2);
    expect(intercept).toBeDefined();
    if (intercept) {
        expect(intercept.x).toBe(1);
        expect(intercept.y).toBe(55);
    }
});

test('Algebra - Vertical Intercept (1 line, but opposite) Intercepting', () => {
    const line1 = convertToInterceptFormula(makeLine(0, 55, 100, 55));
    const line2 = convertToInterceptFormula(makeLine(1, 1, 1, 100));
    const intercept = lineIntersection(line1, line2);
    expect(intercept).toBeDefined();
    if (intercept) {
        expect(intercept.x).toBe(1);
        expect(intercept.y).toBe(55);
    }
});

test('Algebra - Vertical Intercept (1 line) Not Intercepting', () => {
    const line1 = convertToInterceptFormula(makeLine(100, 50, 100, 100));
    const line2 = convertToInterceptFormula(makeLine(80, 10, 80, 10));
    const intercept = lineIntersection(line1, line2);
    expect(intercept).toBeUndefined();
});

test('Algebra - Vertical Intercept (2 lines) Not Intercepting', () => {
    const line1 = convertToInterceptFormula(makeLine(0, 0, 0, 10));
    const line2 = convertToInterceptFormula(makeLine(1, 0, 1, 10));
    const intercept = lineIntersection(line1, line2);
    expect(intercept).toBeUndefined();
    expect(line1.meta.type).toBe('vertical');
    expect(line2.meta.type).toBe('vertical');
});
