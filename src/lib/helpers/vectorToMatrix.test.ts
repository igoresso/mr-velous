import { describe, it, expect } from 'vitest';
import { vectorToMatrix } from './vectorToMatrix';

describe('vectorToMatrix', () => {
	it('should convert a Float32Array 3x3 vector to a column-major matrix', () => {
		const vector = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);
		const expectedMatrix = [
			[1, 4, 7],
			[2, 5, 8],
			[3, 6, 9]
		];

		const result = vectorToMatrix(vector);
		expect(result).toEqual(expectedMatrix);
	});

	it('should convert a Uint8Array 2x2 vector to a column-major matrix', () => {
		const vector = new Uint8Array([1, 2, 3, 4]);
		const expectedMatrix = [
			[1, 3],
			[2, 4]
		];

		const result = vectorToMatrix(vector);
		expect(result).toEqual(expectedMatrix);
	});

	it('should throw an error if the Uint16Array vector length is not a perfect square', () => {
		const invalidVector = new Uint16Array([1, 2, 3, 4, 5]);

		expect(() => vectorToMatrix(invalidVector)).toThrow(
			'The vector length must be a perfect square.'
		);
	});

	it('should convert a Float64Array 4x4 vector to a column-major matrix', () => {
		const vector = new Float64Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
		const expectedMatrix = [
			[1, 5, 9, 13],
			[2, 6, 10, 14],
			[3, 7, 11, 15],
			[4, 8, 12, 16]
		];

		const result = vectorToMatrix(vector);
		expect(result).toEqual(expectedMatrix);
	});
});
