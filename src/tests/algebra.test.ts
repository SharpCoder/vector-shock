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
        meta: BLANK_META,
    };

    const line2: LineInterceptFormula = {
        m: -0.5,
        b: 7,
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
        meta: BLANK_META,
    };

    const line2: LineInterceptFormula = {
        m: 0,
        b: 600,
        meta: BLANK_META,
    };

    const intercept = lineIntersection(line1, line2);
    expect(intercept).toBeDefined();
    if (intercept) {
        expect(intercept.x).toBe(600);
        expect(intercept.y).toBe(600);
    }
});
