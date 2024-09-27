import { readFileAsArrayBuffer } from './readFileAsArrayBuffer';
import { parseArrayBufferAsNIFTI } from './parseArrayBufferAsNIFTI';
import type { Dataset } from '$lib/types';

export async function processFile(file: File): Promise<Dataset> {
	try {
		const arrayBuffer = await readFileAsArrayBuffer(file);
		const dataset = await parseArrayBufferAsNIFTI(arrayBuffer);
		return dataset;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error(`Failed to process file`, { cause: error });
		}
	}
}
