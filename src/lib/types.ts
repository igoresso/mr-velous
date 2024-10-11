import type { Image } from 'itk-wasm';
import type { ZoomTransform } from 'd3-zoom';

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
	currentSlice: number;
	slices: number;
	rows: number;
	cols: number;
	voxelRatio: number;
	color: string;
	transform: ZoomTransform;
};
