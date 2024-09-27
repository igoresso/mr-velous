import { describe, it, expect } from 'vitest';
import { computeMinAndMax } from './computeMinAndMax';

describe('computeMinAndMax', () => {
	it('should return correct min and max for Uint8Array', () => {
		const data: Uint8Array = new Uint8Array([3, 1, 4, 1, 5, 9, 2, 6, 5]);
		const result = computeMinAndMax(data);
		expect(result).toEqual({ min: 1, max: 9 });
	});

	it('should return correct min and max for Int16Array', () => {
		const data: Int16Array = new Int16Array([-10, 0, 10, 20, -20, 30]);
		const result = computeMinAndMax(data);
		expect(result).toEqual({ min: -20, max: 30 });
	});

	it('should return correct min and max for Float32Array', () => {
		const data: Float32Array = new Float32Array([0.1, -0.2, 3.14, 2.71]);
		const result = computeMinAndMax(data);
		expect(result.min).toBeCloseTo(-0.2);
		expect(result.max).toBeCloseTo(3.14);
	});

	it('should return correct min and max for single element array', () => {
		const data: Uint32Array = new Uint32Array([42]);
		const result = computeMinAndMax(data);
		expect(result).toEqual({ min: 42, max: 42 });
	});

	it('should return correct min and max for array with all identical elements', () => {
		const data: Int8Array = new Int8Array([7, 7, 7, 7]);
		const result = computeMinAndMax(data);
		expect(result).toEqual({ min: 7, max: 7 });
	});

	it('should handle arrays with negative and positive numbers', () => {
		const data: Float64Array = new Float64Array([-100.5, 0, 100.5]);
		const result = computeMinAndMax(data);
		expect(result.min).toBeCloseTo(-100.5);
		expect(result.max).toBeCloseTo(100.5);
	});

	it('should handle large numbers correctly', () => {
		const data: Uint32Array = new Uint32Array([0, 4294967295, 123456789]);
		const result = computeMinAndMax(data);
		expect(result).toEqual({ min: 0, max: 4294967295 });
	});

	it('should throw an error for empty arrays', () => {
		const data: Uint8Array = new Uint8Array([]);
		expect(() => computeMinAndMax(data)).toThrow('The input array is empty');
	});

	it('should work with Int32Array containing both negative and positive integers', () => {
		const data: Int32Array = new Int32Array([-2147483648, 0, 2147483647]);
		const result = computeMinAndMax(data);
		expect(result).toEqual({ min: -2147483648, max: 2147483647 });
	});
});
