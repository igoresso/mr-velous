import { describe, it, expect } from 'vitest';
import { extractSliceFromVolume } from './extractSliceFromVolume';
import type { TypedArray } from '../types';

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
	it('should extract a slice along axis 1 (YZ plane)', () => {
		const dims = createDims(3, 4, 5);
		const data = createData(dims, Uint8Array);

		const sliceIndex = 1;
		const result = extractSliceFromVolume(dims, data, 1, sliceIndex);

		const expectedLength = dims[2] * dims[3]; // ny * nz
		expect(result.length).toBe(expectedLength);

		// Verify the extracted values
		let idx = 0;
		for (let z = 0; z < dims[3]; z++) {
			for (let y = 0; y < dims[2]; y++) {
				const index = sliceIndex + y * dims[1] + z * dims[1] * dims[2];
				expect(result[idx++]).toBe(data[index]);
			}
		}
	});

	it('should extract a slice along axis 2 (XZ plane)', () => {
		const dims = createDims(3, 4, 5);
		const data = createData(dims, Int16Array);

		const sliceIndex = 2;
		const result = extractSliceFromVolume(dims, data, 2, sliceIndex);

		const expectedLength = dims[1] * dims[3]; // nx * nz
		expect(result.length).toBe(expectedLength);

		// Verify the extracted values
		let idx = 0;
		for (let z = 0; z < dims[3]; z++) {
			for (let x = 0; x < dims[1]; x++) {
				const index = x + sliceIndex * dims[1] + z * dims[1] * dims[2];
				expect(result[idx++]).toBe(data[index]);
			}
		}
	});

	it('should extract a slice along axis 3 (XY plane)', () => {
		const dims = createDims(3, 4, 5);
		const data = createData(dims, Float32Array);

		const sliceIndex = 3;
		const result = extractSliceFromVolume(dims, data, 3, sliceIndex);

		const expectedLength = dims[1] * dims[2]; // nx * ny
		expect(result.length).toBe(expectedLength);

		const start = dims[1] * dims[2] * sliceIndex;
		const end = start + expectedLength;
		const expectedSlice = data.slice(start, end);

		expect(result).toEqual(expectedSlice);
	});

	it('should throw an error for out-of-bounds slice index', () => {
		const dims = createDims(3, 4, 5);
		const data = createData(dims, Uint8Array);

		const invalidSliceIndex = 5; // Out of bounds for axis with size 5
		expect(() => extractSliceFromVolume(dims, data, 3, invalidSliceIndex)).toThrow(
			`Slice ${invalidSliceIndex} is out of bounds for dim[3]`
		);
	});

	it('should throw an error for invalid axis', () => {
		const dims = createDims(3, 4, 5);
		const data = createData(dims, Uint8Array);

		// @ts-expect-error Testing invalid axis
		expect(() => extractSliceFromVolume(dims, data, 4, 0)).toThrow('Axis 4 can only be 1, 2, or 3');
	});

	it('should correctly handle single-element slices', () => {
		const dims = createDims(1, 1, 1);
		const data = createData(dims, Int32Array);

		const result = extractSliceFromVolume(dims, data, 1, 0);
		expect(result.length).toBe(1);
		expect(result[0]).toBe(data[0]);
	});

	it('should work with different TypedArray types', () => {
		const dims = createDims(2, 2, 2);

		const dataTypes = [Uint8Array, Int16Array, Float64Array];
		dataTypes.forEach((TypedArrayConstructor) => {
			const data = createData(dims, TypedArrayConstructor);
			const result = extractSliceFromVolume(dims, data, 3, 1);
			expect(result).toBeInstanceOf(TypedArrayConstructor);
		});
	});

	it('should extract correct data for axis 1, slice 0', () => {
		const dims = createDims(2, 2, 2);
		const data = createData(dims, Uint8Array);

		const sliceIndex = 0;
		const result = extractSliceFromVolume(dims, data, 1, sliceIndex);

		const expectedValues = [];
		for (let z = 0; z < dims[3]; z++) {
			for (let y = 0; y < dims[2]; y++) {
				const index = sliceIndex + y * dims[1] + z * dims[1] * dims[2];
				expectedValues.push(data[index]);
			}
		}
		expect(Array.from(result)).toEqual(expectedValues);
	});

	it('should extract correct data for axis 2, slice 1', () => {
		const dims = createDims(2, 2, 2);
		const data = createData(dims, Uint8Array);

		const sliceIndex = 1;
		const result = extractSliceFromVolume(dims, data, 2, sliceIndex);

		const expectedValues = [];
		for (let z = 0; z < dims[3]; z++) {
			for (let x = 0; x < dims[1]; x++) {
				const index = x + sliceIndex * dims[1] + z * dims[1] * dims[2];
				expectedValues.push(data[index]);
			}
		}
		expect(Array.from(result)).toEqual(expectedValues);
	});

	it('should extract correct data for axis 3, slice 0', () => {
		const dims = createDims(2, 2, 2);
		const data = createData(dims, Uint8Array);

		const sliceIndex = 0;
		const result = extractSliceFromVolume(dims, data, 3, sliceIndex);

		const expectedValues = data.slice(0, dims[1] * dims[2]);
		expect(result).toEqual(expectedValues);
	});

	it('should handle non-uniform dimensions', () => {
		const dims = createDims(2, 3, 4);
		const data = createData(dims, Uint8Array);

		const sliceIndex = 2;
		const result = extractSliceFromVolume(dims, data, 2, sliceIndex);

		const expectedLength = dims[1] * dims[3]; // nx * nz
		expect(result.length).toBe(expectedLength);
	});
});

const createDims = (nx: number, ny: number, nz: number): number[] => [3, nx, ny, nz];

const createData = (dims: number[], constructor: TypedArrayConstructor): TypedArray => {
	const totalElements = dims[1] * dims[2] * dims[3];
	const dataArray = new constructor(totalElements);

	// Fill the array with sequential numbers
	for (let i = 0; i < totalElements; i++) {
		dataArray[i] = i;
	}

	return dataArray;
};
