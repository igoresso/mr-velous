import type { NIFTI1, NIFTI2 } from 'nifti-reader-js';

export type Header = NIFTI1 | NIFTI2;

export type TypedArray =
	| Uint8Array
	| Uint16Array
	| Uint32Array
	| Int8Array
	| Int16Array
	| Int32Array
	| Float32Array
	| Float64Array;

export type Dataset = {
	header: Header;
	data: TypedArray;
};

export type View = Dataset & {
	id: string;
	fileName: string;
	axis: 1 | 2 | 3;
	slice: number;
	rows: number;
	cols: number;
	fov: [number, number, number];
	voxelRatio: number;
	min: number;
	max: number;
};
