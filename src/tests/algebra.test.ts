import { expect, test } from 'vitest';
import {
    convertToInterceptFormula,
    makeLine,
    type LineInterceptFormula,
    lineIntersection,
} from '../algebra';

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
    };

    const line2: LineInterceptFormula = {
        m: -0.5,
        b: 7,
    };

    const intercept = lineIntersection(line1, line2);
    expect(intercept.x).toBe(1.6);
    expect(intercept.y).toBe(6.2);
});
