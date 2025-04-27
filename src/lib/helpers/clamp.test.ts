import { describe, it, expect } from 'vitest';
import { clamp } from './clamp';

describe('clamp', () => {
	it('returns min when value is less than min', () => {
		expect(clamp(-5, 0, 10)).toBe(0);
	});

	it('returns max when value is greater than max', () => {
		expect(clamp(15, 0, 10)).toBe(10);
	});

	it('returns the value when within range', () => {
		expect(clamp(5, 0, 10)).toBe(5);
	});

	it('returns min when value equals min', () => {
		expect(clamp(0, 0, 10)).toBe(0);
	});

	it('returns max when value equals max', () => {
		expect(clamp(10, 0, 10)).toBe(10);
	});

	it('handles floating point values correctly', () => {
		expect(clamp(2.5, 1.2, 3.8)).toBe(2.5);
		expect(clamp(0.5, 1.2, 3.8)).toBe(1.2);
		expect(clamp(4.2, 1.2, 3.8)).toBe(3.8);
	});
});
