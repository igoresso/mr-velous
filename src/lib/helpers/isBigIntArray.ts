import type { TypedArray } from '$lib/types';

export function isBigIntArray(array: TypedArray): boolean {
	return array instanceof BigInt64Array || array instanceof BigUint64Array;
}
