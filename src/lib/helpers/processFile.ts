import { readFileAsArrayBuffer } from './readFileAsArrayBuffer';
import { parseArrayBufferAsNIFTI } from './parseArrayBufferAsNIFTI';
import type { Dataset } from '$lib/types';

export async function processFile(file: File): Promise<Dataset> {
	try {
		const arrayBuffer = await readFileAsArrayBuffer(file);
		const dataset = await parseArrayBufferAsNIFTI(arrayBuffer);
		return dataset;
	} catch (error) {
		throw new Error(`Failed to process file`, { cause: error });
	}
}
