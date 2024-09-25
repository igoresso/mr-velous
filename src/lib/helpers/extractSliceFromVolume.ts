import type { TypedArray } from '../types';

export function extractSliceFromVolume(
	dims: number[],
	data: TypedArray,
	axis: 1 | 2 | 3,
	slice: number
): typeof data {
	const nx = dims[1]; // X dimension
	const ny = dims[2]; // Y dimension
	const nz = dims[3]; // Z dimension

	if (slice >= dims[axis]) {
		throw new Error(`Slice ${slice} is out of bounds for dim[${axis}]`);
	}

	// Explicitly define the constructor type
	type TypedArrayConstructor = {
		new (length: number): typeof data;
		new (elements: Iterable<number>): typeof data;
	};

	// Cast data.constructor to the correct type
	const TypedArray = data.constructor as TypedArrayConstructor;

	switch (axis) {
		case 1: {
			// YZ plane at x = slice
			const planeLength = ny * nz;
			const plane = new TypedArray(planeLength);
			let idx = 0;
			for (let z = 0; z < nz; z++) {
				for (let y = 0; y < ny; y++) {
					const index = slice + y * nx + z * nx * ny;
					plane[idx++] = data[index];
				}
			}
			return plane;
		}
		case 2: {
			// XZ plane at y = slice
			const planeLength = nx * nz;
			const plane = new TypedArray(planeLength);
			let idx = 0;
			for (let z = 0; z < nz; z++) {
				for (let x = 0; x < nx; x++) {
					const index = x + slice * nx + z * nx * ny;
					plane[idx++] = data[index];
				}
			}
			return plane;
		}
		case 3: {
			// XY plane at z = slice
			const start = nx * ny * slice;
			const end = start + nx * ny;
			return data.slice(start, end);
		}
		default:
			throw new Error(`Axis ${axis} can only be 1, 2, or 3`);
	}
}
