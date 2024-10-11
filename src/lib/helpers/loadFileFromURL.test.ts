// loadFileFromURL.test.ts

import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadFileFromURL } from './loadFileFromURL';

describe('loadFileFromURL', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	it('should return a Blob when fetch is successful', async () => {
		const mockBlob = new Blob(['test content'], { type: 'text/plain' });
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			blob: vi.fn().mockResolvedValue(mockBlob)
		} as unknown as Response);

		const result = await loadFileFromURL('https://example.com/file.txt');
		expect(result).toBe(mockBlob);
		expect(global.fetch).toHaveBeenCalledWith('https://example.com/file.txt', expect.any(Object));
	});

	it('should throw "Request timed out" when fetch takes longer than timeout', async () => {
		vi.useFakeTimers();

		const fetchMock = vi.fn((url: string, options?: RequestInit): Promise<Response> => {
			return new Promise((_, reject) => {
				if (options?.signal) {
					options.signal.addEventListener('abort', () => {
						const error = new Error('The user aborted a request.');
						error.name = 'AbortError';
						reject(error);
					});
				}
				// The promise never resolves unless aborted
			});
		});

		global.fetch = fetchMock as typeof fetch;

		const promise = loadFileFromURL('https://example.com/slow-file.txt');

		vi.advanceTimersByTime(10000);

		await vi.runAllTicks();

		await expect(promise).rejects.toThrow('Request timed out');

		expect(global.fetch).toHaveBeenCalledWith(
			'https://example.com/slow-file.txt',
			expect.any(Object)
		);
	});

	it('should throw an error when fetch response is not ok', async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
			statusText: 'Not Found'
		} as Response);

		await expect(loadFileFromURL('https://example.com/not-found.txt')).rejects.toThrow(
			'Network error: Not Found'
		);
		expect(global.fetch).toHaveBeenCalledWith(
			'https://example.com/not-found.txt',
			expect.any(Object)
		);
	});

	it('should rethrow other errors', async () => {
		const errorMessage = 'Network failure';
		global.fetch = vi.fn().mockRejectedValue(new Error(errorMessage));

		await expect(loadFileFromURL('https://example.com/error.txt')).rejects.toThrow(errorMessage);
		expect(global.fetch).toHaveBeenCalledWith('https://example.com/error.txt', expect.any(Object));
	});
});
