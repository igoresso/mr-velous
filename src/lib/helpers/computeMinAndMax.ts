import type { TypedArray } from '$lib/types';

export function computeMinAndMax(data: TypedArray): { min: number; max: number } {
	if (data.length === 0) {
		throw new Error('The input array is empty');
	}

	let min = data[0];
	let max = data[0];

	for (const value of data) {
		if (value < min) min = value;
		else if (value > max) max = value;
	}

	return { min, max };
}
