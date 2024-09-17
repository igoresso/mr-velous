import * as nifti from 'nifti-reader-js';
import type { Dataset } from '$lib/types';

export async function parseArrayBufferAsNIFTI(arrayBuffer: ArrayBuffer): Promise<Dataset> {
	if (nifti.isCompressed(arrayBuffer)) {
		arrayBuffer = nifti.decompress(arrayBuffer);
	}

	if (!nifti.isNIFTI(arrayBuffer)) {
		throw new Error('Invalid NIFTI file.');
	}

	const niftiHeader = nifti.readHeader(arrayBuffer) as Dataset['header'];
	const niftiData = nifti.readImage(niftiHeader, arrayBuffer);

	// Map of NIFTI datatype codes to TypedArray constructors
	const dataTypeMap: Record<number, new (buffer: ArrayBuffer) => Dataset['data']> = {
		[nifti.NIFTI1.TYPE_UINT8]: Uint8Array,
		[nifti.NIFTI1.TYPE_UINT16]: Uint16Array,
		[nifti.NIFTI1.TYPE_UINT32]: Uint32Array,
		[nifti.NIFTI1.TYPE_INT8]: Int8Array,
		[nifti.NIFTI1.TYPE_INT16]: Int16Array,
		[nifti.NIFTI1.TYPE_INT32]: Int32Array,
		[nifti.NIFTI1.TYPE_FLOAT32]: Float32Array,
		[nifti.NIFTI1.TYPE_FLOAT64]: Float64Array,
		[nifti.NIFTI1.TYPE_INT64]: BigInt64Array,
		[nifti.NIFTI1.TYPE_UINT64]: BigUint64Array
	};

	const TypedArrayConstructor = dataTypeMap[niftiHeader.datatypeCode];
	if (!TypedArrayConstructor) {
		throw new Error('Unsupported NIFTI datatype.');
	}

	const niftiTypedData = new TypedArrayConstructor(niftiData);

	return { header: niftiHeader, data: niftiTypedData };
}
