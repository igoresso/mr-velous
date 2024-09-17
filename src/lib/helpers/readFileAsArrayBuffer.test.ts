import { describe, it, expect } from 'vitest';
import { readFileAsArrayBuffer } from './readFileAsArrayBuffer';

describe('readFileAsArrayBuffer', () => {
	it('should read the file and return an ArrayBuffer', async () => {
		const content = 'Hello, World!';
		const blob = new Blob([content], { type: 'text/plain' });
		const file = new File([blob], 'test.txt', { type: 'text/plain' });

		const result = await readFileAsArrayBuffer(file);
		const expectedArrayBuffer = new TextEncoder().encode(content).buffer;

		expect(new Uint8Array(result)).toEqual(new Uint8Array(expectedArrayBuffer));
	});

	it('should reject if reading fails', async () => {
		const originalFileReader = globalThis.FileReader;

		class MockFileReader {
			onload: ((ev: ProgressEvent) => void) | null = null;
			onerror: ((ev: ProgressEvent) => void) | null = null;

			readAsArrayBuffer() {
				if (this.onerror) {
					const event = new ProgressEvent('error');
					this.onerror(event);
				}
			}
		}

		// Replace the global FileReader with the mock
		globalThis.FileReader = MockFileReader as unknown as typeof FileReader;

		// Test a mock file
		const content = 'Hello, World!';
		const blob = new Blob([content], { type: 'text/plain' });
		const file = new File([blob], 'test.txt', { type: 'text/plain' });

		await expect(readFileAsArrayBuffer(file)).rejects.toThrow('Failed to read file');

		// Restore the original FileReader
		globalThis.FileReader = originalFileReader;
	});
});
