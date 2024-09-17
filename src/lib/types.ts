import type { NIFTI1, NIFTI2 } from 'nifti-reader-js';

export type Dataset = {
	header: NIFTI1 | NIFTI2;
	data:
		| Uint8Array
		| Uint16Array
		| Uint32Array
		| Int8Array
		| Int16Array
		| Int32Array
		| Float32Array
		| Float64Array
		| BigInt64Array
		| BigUint64Array;
};

export type View = {
	id: string;
	axis: number;
	slice: number;
	rows: number;
	cols: number;
	fov: [number, number];
	voxelRatio: number;
};

export type Entry = Dataset & {
	id: string;
	fileName: string;
	views: View[];
};
