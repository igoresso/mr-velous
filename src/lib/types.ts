import type { ZoomTransform } from 'd3-zoom';
import type { Image } from 'itk-wasm';

import { DICOM_TAGS } from '$lib/config';

export type NumberTypedArray =
	| Int8Array
	| Uint8Array
	| Int16Array
	| Uint16Array
	| Int32Array
	| Uint32Array
	| Uint8ClampedArray
	| Float32Array
	| Float64Array;

export type BigIntTypedArray = BigInt64Array | BigUint64Array;
export type TypedArray = NumberTypedArray | BigIntTypedArray;

export type Volume = Image & {
	id: string;
	fileName: string;
	data: NumberTypedArray;
	min: number;
	max: number;
	brightnessFactor: number;
	contrastFactor: number;
	opacity: number;
	isActive: boolean;
	isVisible: boolean;
};

export type View = {
	axis: 0 | 1 | 2;
	plane: 'AXIAL' | 'CORONAL' | 'SAGITTAL';
	currentSlice: number;
	slices: number;
	rows: number;
	cols: number;
	voxelRatio: number;
	color: string;
	transform: ZoomTransform;
	flipX: boolean;
	flipY: boolean;
	transpose: boolean;
};

export type TagName = keyof typeof DICOM_TAGS;
export type TagCode = (typeof DICOM_TAGS)[TagName];
export type DicomHeaderByName = { [K in TagName]: string };
export type DicomHeaderByCode = { [C in TagCode]: string };
