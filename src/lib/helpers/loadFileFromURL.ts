import { parseArrayBufferAsNIFTI } from './parseArrayBufferAsNIFTI';
import type { Dataset } from '$lib/types';

export async function loadFileFromURL(url: string): Promise<Dataset> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 10000);

	try {
		const response = await fetch(url, { signal: controller.signal });

		clearTimeout(timeout);

		if (!response.ok) {
			throw new Error(`Network error: ${response.statusText}`);
		}

		const arrayBuffer = await response.arrayBuffer();
		const dataset = await parseArrayBufferAsNIFTI(arrayBuffer);
		return dataset;
	} catch (error) {
		if (error instanceof Error) {
			if (error.name === 'AbortError') {
				throw new Error('Request timed out');
			}
			throw new Error(`Failed to process file: ${error.message}`);
		} else {
			throw new Error('Failed to process file', { cause: error });
		}
	} finally {
		clearTimeout(timeout);
	}
}
