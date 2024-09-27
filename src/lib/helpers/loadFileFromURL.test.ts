// loadFileFromURL.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadFileFromURL } from './loadFileFromURL';
import { parseArrayBufferAsNIFTI } from './parseArrayBufferAsNIFTI';
import type { Dataset, Header } from '$lib/types';

vi.mock('./parseArrayBufferAsNIFTI');

describe('loadFileFromURL', () => {
	const mockParseArrayBufferAsNIFTI = vi.mocked(parseArrayBufferAsNIFTI);

	beforeEach(() => {
		vi.resetAllMocks();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should fetch file from URL and return dataset', async () => {
		// Mock fetch to return a successful response
		const mockArrayBuffer = new ArrayBuffer(8);
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			arrayBuffer: () => Promise.resolve(mockArrayBuffer)
		} as unknown as Response);

		// Mock parseArrayBufferAsNIFTI to return a dataset
		const mockDataset: Dataset = {
			header: {
				littleEndian: true,
				dim_info: 54,
				dims: [1, 1, 1, 1, 1, 1, 1, 1],
				intent_p1: 0,
				intent_p2: 0,
				intent_p3: 0,
				intent_code: 0,
				datatypeCode: 4,
				numBitsPerVoxel: 16,
				slice_start: 0,
				slice_end: 0,
				slice_code: 0,
				pixDims: [1, 1, 1, 1, 0, 0, 0, 0],
				vox_offset: 352,
				scl_slope: 1,
				scl_inter: 0,
				xyzt_units: 10,
				cal_max: 0,
				cal_min: 0,
				slice_duration: 0,
				toffset: 0,
				description: '',
				aux_file: '',
				intent_name: '',
				qform_code: 1,
				sform_code: 1,
				quatern_a: 1,
				quatern_b: 0,
				quatern_c: 0,
				quatern_d: 0,
				qoffset_x: 0,
				qoffset_y: 0,
				qoffset_z: 0,
				affine: [
					[1, 0, 0, 0],
					[0, 1, 0, 0],
					[0, 0, 1, 0],
					[0, 0, 0, 1]
				],
				qfac: 1,
				magic: 'n+1',
				isHDR: false,
				extensionFlag: [0, 0, 0, 0],
				extensionSize: 0,
				extensionCode: 0,
				extensions: []
			} as unknown as Header, // Type assertion added here
			data: new Uint8Array([1, 2, 3])
		};
		mockParseArrayBufferAsNIFTI.mockResolvedValue(mockDataset);

		const url = 'http://example.com/file.nii';
		const result = await loadFileFromURL(url);

		expect(result).toEqual(mockDataset);
		expect(globalThis.fetch).toHaveBeenCalledWith(url, expect.any(Object));
		expect(mockParseArrayBufferAsNIFTI).toHaveBeenCalledWith(mockArrayBuffer);
	});

	it('should throw error when response is not ok', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
			statusText: 'Not Found'
		} as unknown as Response);

		const url = 'http://example.com/file.nii';
		await expect(loadFileFromURL(url)).rejects.toThrow('Network error: Not Found');
		expect(globalThis.fetch).toHaveBeenCalledWith(url, expect.any(Object));
	});

	it('should throw timeout error if request takes too long', async () => {
		vi.useFakeTimers();

		// Mock fetch to handle the abort signal
		globalThis.fetch = vi.fn((input: RequestInfo, init?: RequestInit) => {
			return new Promise((resolve, reject) => {
				// Listen for the abort event
				if (init?.signal) {
					init.signal.addEventListener('abort', () => {
						const error = new Error('The user aborted a request.');
						error.name = 'AbortError';
						reject(error);
					});
				}
				// Simulate a long-running request by not resolving or rejecting
			});
		}) as unknown as typeof fetch;

		const url = 'http://example.com/file.nii';
		const loadPromise = loadFileFromURL(url);

		// Advance timers to trigger the timeout
		vi.advanceTimersByTime(10001);

		// Wait for all pending promises and timers
		await Promise.resolve();

		// Assert that the promise rejects with 'Request timed out'
		await expect(loadPromise).rejects.toThrow('Request timed out');
		expect(globalThis.fetch).toHaveBeenCalledWith(url, expect.any(Object));

		vi.useRealTimers();
	});

	it('should throw error if parseArrayBufferAsNIFTI fails', async () => {
		const mockArrayBuffer = new ArrayBuffer(8);
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			arrayBuffer: () => Promise.resolve(mockArrayBuffer)
		} as unknown as Response);

		// Mock parseArrayBufferAsNIFTI to throw an error
		mockParseArrayBufferAsNIFTI.mockRejectedValue(new Error('Parsing failed'));

		const url = 'http://example.com/file.nii';
		await expect(loadFileFromURL(url)).rejects.toThrow('Parsing failed');
		expect(globalThis.fetch).toHaveBeenCalledWith(url, expect.any(Object));
		expect(mockParseArrayBufferAsNIFTI).toHaveBeenCalledWith(mockArrayBuffer);
	});
});
