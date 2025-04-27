import { describe, it, expect, beforeAll } from 'vitest';
import { readFileAsArrayBuffer } from './readFileAsArrayBuffer';

// Define proper types for our mocks
type MockEvent = {
	type: string;
};

interface IMockBlob {
	_content: Uint8Array;
	type: string;
}

interface IMockFile extends IMockBlob {
	name: string;
}

interface IMockFileReader {
	result: ArrayBuffer | null;
	onload: ((ev: MockEvent) => void) | null;
	onerror: ((ev: MockEvent) => void) | null;
	readAsArrayBuffer(file: IMockFile | File): void;
}

describe('readFileAsArrayBuffer', () => {
	beforeAll(() => {
		// Ensure Blob and File are available in the test environment
		if (typeof globalThis.Blob === 'undefined') {
			globalThis.Blob = class MockBlob implements IMockBlob {
				_content: Uint8Array;
				type: string;

				constructor(
					parts: Array<string | Blob | ArrayBuffer | ArrayBufferView>,
					options?: BlobPropertyBag
				) {
					const text = parts.map((p) => (typeof p === 'string' ? p : '')).join('');
					this._content = new TextEncoder().encode(text);
					this.type = options?.type || '';
				}
			} as unknown as typeof Blob;
		}

		if (typeof globalThis.File === 'undefined') {
			// Create MockFile as a completely new class, not extending Blob
			globalThis.File = class MockFile implements IMockFile {
				_content: Uint8Array;
				type: string;
				name: string;

				constructor(
					parts: Array<string | Blob | ArrayBuffer | ArrayBufferView>,
					name: string,
					options?: FilePropertyBag
				) {
					const text = parts.map((p) => (typeof p === 'string' ? p : '')).join('');
					this._content = new TextEncoder().encode(text);
					this.type = options?.type || '';
					this.name = name;
				}
			} as unknown as typeof File;
		}

		// Mock FileReader
		if (typeof globalThis.FileReader === 'undefined') {
			globalThis.FileReader = class MockFileReader implements IMockFileReader {
				result: ArrayBuffer | null = null;
				onload: ((ev: MockEvent) => void) | null = null;
				onerror: ((ev: MockEvent) => void) | null = null;

				readAsArrayBuffer(file: File): void {
					// For successful reading, create a result and trigger onload
					let content: Uint8Array;

					if ((file as unknown as IMockBlob)?._content) {
						content = (file as unknown as IMockBlob)._content;
					} else {
						content = new TextEncoder().encode('Hello, World!');
					}

					// Ensure we have a proper ArrayBuffer by creating a new one if necessary
					const buffer = content.buffer;
					this.result =
						buffer instanceof ArrayBuffer ? buffer : new ArrayBuffer(content.byteLength);

					// If we had to create a new buffer, copy the content
					if (this.result !== buffer) {
						new Uint8Array(this.result).set(content);
					}

					// Use queueMicrotask for async behavior
					queueMicrotask(() => {
						if (this.onload) {
							this.onload({ type: 'load' });
						}
					});
				}
			} as unknown as typeof FileReader;
		}
	});

	it('should read the file and return an ArrayBuffer', async () => {
		const content = 'Hello, World!';
		const file = new File([content], 'test.txt', { type: 'text/plain' });

		const result = await readFileAsArrayBuffer(file);
		const expectedArrayBuffer = new TextEncoder().encode(content).buffer;

		// Compare the Uint8Array views instead of the buffers directly
		expect(Array.from(new Uint8Array(result))).toEqual(
			Array.from(new Uint8Array(expectedArrayBuffer))
		);
	});

	it('should reject if reading fails', async () => {
		// Create a failing FileReader just for this test
		const originalFileReader = globalThis.FileReader;

		// Override with a failing implementation
		class FailingFileReader implements IMockFileReader {
			result: ArrayBuffer | null = null;
			onload: ((ev: MockEvent) => void) | null = null;
			onerror: ((ev: MockEvent) => void) | null = null;

			readAsArrayBuffer(): void {
				queueMicrotask(() => {
					if (this.onerror) {
						this.onerror({ type: 'error' });
					}
				});
			}
		}

		globalThis.FileReader = FailingFileReader as unknown as typeof FileReader;

		const content = 'Hello, World!';
		const file = new File([content], 'test.txt', { type: 'text/plain' });

		await expect(readFileAsArrayBuffer(file)).rejects.toThrow('Failed to read file');

		// Restore original
		globalThis.FileReader = originalFileReader;
	});
});
