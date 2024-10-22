import { type TypedArray } from '$lib/types';

export function vectorToMatrix(vector: TypedArray): number[][] {
	const N = Math.sqrt(vector.length);

	if (!Number.isInteger(N)) {
		throw new Error('The vector length must be a perfect square.');
	}

	const matrix: number[][] = Array.from({ length: N }, () => Array(N).fill(0));

	for (let i = 0; i < N; i++) {
		for (let j = 0; j < N; j++) {
			matrix[j][i] = Number(vector[i * N + j]);
		}
	}

	return matrix;
}
