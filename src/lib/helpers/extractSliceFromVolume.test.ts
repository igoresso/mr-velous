import { describe, it, expect } from 'vitest';
import { extractSliceFromVolume } from './extractSliceFromVolume';
import type { NumberTypedArray } from '../types';

type TypedArrayConstructor =
	| Uint8ArrayConstructor
	| Uint16ArrayConstructor
	| Uint32ArrayConstructor
	| Int8ArrayConstructor
	| Int16ArrayConstructor
	| Int32ArrayConstructor
	| Float32ArrayConstructor
	| Float64ArrayConstructor;

describe('extractSliceFromVolume', () => {
	it('should extract a slice along axis 0 (YZ plane)', () => {
		const size = [3, 4, 5];
		const data = createData(size, Uint8Array);

		const sliceIndex = 1;
		const result = extractSliceFromVolume(size, data, 0, sliceIndex);

		const expectedLength = size[1] * size[2]; // ny * nz
		expect(result.length).toBe(expectedLength);

		// Verify the extracted values
		let idx = 0;
		for (let z = 0; z < size[2]; z++) {
			for (let y = 0; y < size[1]; y++) {
				const index = sliceIndex + y * size[0] + z * size[0] * size[1];
				expect(result[idx++]).toBe(data[index]);
			}
		}
	});

	it('should extract a slice along axis 1 (XZ plane)', () => {
		const size = [3, 4, 5];
		const data = createData(size, Int16Array);

		const sliceIndex = 2;
		const result = extractSliceFromVolume(size, data, 1, sliceIndex);

		const expectedLength = size[0] * size[2]; // nx * nz
		expect(result.length).toBe(expectedLength);

		// Verify the extracted values
		let idx = 0;
		for (let z = 0; z < size[2]; z++) {
			for (let x = 0; x < size[0]; x++) {
				const index = x + sliceIndex * size[0] + z * size[0] * size[1];
				expect(result[idx++]).toBe(data[index]);
			}
		}
	});

	it('should extract a slice along axis 2 (XY plane)', () => {
		const size = [3, 4, 5];
		const data = createData(size, Float32Array);

		const sliceIndex = 3;
		const result = extractSliceFromVolume(size, data, 2, sliceIndex);

		const expectedLength = size[0] * size[1]; // nx * ny
		expect(result.length).toBe(expectedLength);

		const start = size[0] * size[1] * sliceIndex;
		const end = start + expectedLength;
		const expectedSlice = data.slice(start, end);

		expect(result).toEqual(expectedSlice);
	});

	it('should throw an error for out-of-bounds slice index', () => {
		const size = [3, 4, 5];
		const data = createData(size, Uint8Array);

		const invalidSliceIndex = 5; // Out of bounds for axis with size 5
		expect(() => extractSliceFromVolume(size, data, 2, invalidSliceIndex)).toThrow(
			`Slice ${invalidSliceIndex} is out of bounds for dimension 2`
		);
	});

	it('should correctly handle single-element slices', () => {
		const size = [1, 1, 1];
		const data = createData(size, Int32Array);

		const result = extractSliceFromVolume(size, data, 0, 0);
		expect(result.length).toBe(1);
		expect(result[0]).toBe(data[0]);
	});

	it('should work with different NumberTypedArray types', () => {
		const size = [2, 2, 2];

		const dataTypes = [Uint8Array, Int16Array, Float64Array];
		dataTypes.forEach((TypedArrayConstructor) => {
			const data = createData(size, TypedArrayConstructor);
			const result = extractSliceFromVolume(size, data, 2, 1);
			expect(result).toBeInstanceOf(TypedArrayConstructor);
		});
	});

	it('should extract correct data for axis 0, slice 0', () => {
		const size = [2, 2, 2];
		const data = createData(size, Uint8Array);

		const sliceIndex = 0;
		const result = extractSliceFromVolume(size, data, 0, sliceIndex);

		const expectedValues = [];
		for (let z = 0; z < size[2]; z++) {
			for (let y = 0; y < size[1]; y++) {
				const index = sliceIndex + y * size[0] + z * size[0] * size[1];
				expectedValues.push(data[index]);
			}
		}
		expect(Array.from(result)).toEqual(expectedValues);
	});

	it('should extract correct data for axis 1, slice 1', () => {
		const size = [2, 2, 2];
		const data = createData(size, Uint8Array);

		const sliceIndex = 1;
		const result = extractSliceFromVolume(size, data, 1, sliceIndex);

		const expectedValues = [];
		for (let z = 0; z < size[2]; z++) {
			for (let x = 0; x < size[0]; x++) {
				const index = x + sliceIndex * size[0] + z * size[0] * size[1];
				expectedValues.push(data[index]);
			}
		}
		expect(Array.from(result)).toEqual(expectedValues);
	});

	it('should extract correct data for axis 2, slice 0', () => {
		const size = [2, 2, 2];
		const data = createData(size, Uint8Array);

		const sliceIndex = 0;
		const result = extractSliceFromVolume(size, data, 2, sliceIndex);

		const expectedValues = data.slice(0, size[0] * size[1]);
		expect(result).toEqual(expectedValues);
	});

	it('should handle non-uniform dimensions', () => {
		const size = [2, 3, 4];
		const data = createData(size, Uint8Array);

		const sliceIndex = 2;
		const result = extractSliceFromVolume(size, data, 1, sliceIndex);

		const expectedLength = size[0] * size[2]; // nx * nz
		expect(result.length).toBe(expectedLength);
	});
});

const createData = (size: number[], constructor: TypedArrayConstructor): NumberTypedArray => {
	const totalElements = size[0] * size[1] * size[2];
	const dataArray = new constructor(totalElements);

	// Fill the array with sequential numbers
	for (let i = 0; i < totalElements; i++) {
		dataArray[i] = i;
	}

	return dataArray;
};
