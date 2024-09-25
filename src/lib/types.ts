import type { ZoomTransform } from 'd3-zoom';
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

export type Volume = Dataset & {
	id: string;
	fileName: string;
	min: number;
	max: number;
	brightnessFactor: number;
	contrastFactor: number;
	opacity: number;
	isActive: boolean;
	isVisible: boolean;
};

export type View = {
	axis: 1 | 2 | 3;
	currentSlice: number;
	slices: number;
	rows: number;
	cols: number;
	voxelRatio: number;
	transform: ZoomTransform;
};
