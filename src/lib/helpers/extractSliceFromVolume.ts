import type { NumberTypedArray } from '../types';

export function extractSliceFromVolume(
	size: number[],
	data: NumberTypedArray,
	axis: 0 | 1 | 2,
	slice: number
): typeof data {
	const [nx, ny] = size;

	if (slice < 0 || slice >= size[axis]) {
		throw new Error(`Slice ${slice} is out of bounds for dimension ${axis}`);
	}

	const strides = [1, nx, nx * ny];
	const axes = [0, 1, 2].filter((a) => a !== axis);

	const rows = size[axes[1]];
	const cols = size[axes[0]];

	const planeLength = rows * cols;
	const TypedArrayConstructor = data.constructor as { new (length: number): NumberTypedArray };
	const plane = new TypedArrayConstructor(planeLength);

	let idx = 0;
	const indices = [0, 0, 0];
	indices[axis] = slice;

	for (let i = 0; i < rows; i++) {
		indices[axes[1]] = i;
		for (let j = 0; j < cols; j++) {
			indices[axes[0]] = j;
			const index = indices[0] * strides[0] + indices[1] * strides[1] + indices[2] * strides[2];
			plane[idx++] = data[index];
		}
	}

	return plane;
}
