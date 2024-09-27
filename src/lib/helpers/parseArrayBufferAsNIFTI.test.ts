import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseArrayBufferAsNIFTI } from './parseArrayBufferAsNIFTI';
import type { Mock } from 'vitest';
import * as nifti from 'nifti-reader-js';

vi.mock('nifti-reader-js', () => ({
	isCompressed: vi.fn(),
	decompress: vi.fn(),
	isNIFTI: vi.fn(),
	readHeader: vi.fn(),
	readImage: vi.fn(),
	NIFTI1: {
		TYPE_UINT8: 2,
		TYPE_UINT16: 512,
		TYPE_UINT32: 768,
		TYPE_INT8: 256,
		TYPE_INT16: 4,
		TYPE_INT32: 8,
		TYPE_FLOAT32: 16,
		TYPE_FLOAT64: 64
	}
}));

describe('parseArrayBufferAsNIFTI', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should correctly parse an uncompressed NIFTI file', async () => {
		const arrayBuffer = new ArrayBuffer(8);

		// Mock the nifti methods
		(nifti.isCompressed as Mock).mockReturnValue(false);
		(nifti.isNIFTI as Mock).mockReturnValue(true);

		const mockHeader = {
			datatypeCode: nifti.NIFTI1.TYPE_INT16
			// Add other necessary header properties if needed
		};
		(nifti.readHeader as Mock).mockReturnValue(mockHeader);

		const mockData = new ArrayBuffer(16);
		(nifti.readImage as Mock).mockReturnValue(mockData);

		const result = await parseArrayBufferAsNIFTI(arrayBuffer);

		expect(nifti.isCompressed).toHaveBeenCalledWith(arrayBuffer);
		expect(nifti.isNIFTI).toHaveBeenCalledWith(arrayBuffer);
		expect(nifti.readHeader).toHaveBeenCalledWith(arrayBuffer);
		expect(nifti.readImage).toHaveBeenCalledWith(mockHeader, arrayBuffer);

		expect(result.header).toEqual(mockHeader);
		expect(result.data).toBeInstanceOf(Int16Array);
		expect(result.data.buffer).toBe(mockData);
	});

	it('should decompress and parse a compressed NIFTI file', async () => {
		const arrayBuffer = new ArrayBuffer(8);
		const decompressedArrayBuffer = new ArrayBuffer(16);

		(nifti.isCompressed as Mock).mockReturnValue(true);
		(nifti.decompress as Mock).mockReturnValue(decompressedArrayBuffer);
		(nifti.isNIFTI as Mock).mockReturnValue(true);

		const mockHeader = {
			datatypeCode: nifti.NIFTI1.TYPE_FLOAT32
		};
		(nifti.readHeader as Mock).mockReturnValue(mockHeader);

		const mockData = new ArrayBuffer(32);
		(nifti.readImage as Mock).mockReturnValue(mockData);

		const result = await parseArrayBufferAsNIFTI(arrayBuffer);

		expect(nifti.isCompressed).toHaveBeenCalledWith(arrayBuffer);
		expect(nifti.decompress).toHaveBeenCalledWith(arrayBuffer);
		expect(nifti.isNIFTI).toHaveBeenCalledWith(decompressedArrayBuffer);
		expect(nifti.readHeader).toHaveBeenCalledWith(decompressedArrayBuffer);
		expect(nifti.readImage).toHaveBeenCalledWith(mockHeader, decompressedArrayBuffer);

		expect(result.header).toEqual(mockHeader);
		expect(result.data).toBeInstanceOf(Float32Array);
		expect(result.data.buffer).toBe(mockData);
	});

	it('should throw an error for an invalid NIFTI file', async () => {
		const arrayBuffer = new ArrayBuffer(8);

		(nifti.isCompressed as Mock).mockReturnValue(false);
		(nifti.isNIFTI as Mock).mockReturnValue(false);

		await expect(parseArrayBufferAsNIFTI(arrayBuffer)).rejects.toThrow('Invalid NIFTI file');

		expect(nifti.isCompressed).toHaveBeenCalledWith(arrayBuffer);
		expect(nifti.isNIFTI).toHaveBeenCalledWith(arrayBuffer);
	});

	it('should throw an error for an unsupported NIFTI datatype', async () => {
		const arrayBuffer = new ArrayBuffer(8);

		(nifti.isCompressed as Mock).mockReturnValue(false);
		(nifti.isNIFTI as Mock).mockReturnValue(true);

		const mockHeader = {
			datatypeCode: 9999 // Unsupported datatype code
		};
		(nifti.readHeader as Mock).mockReturnValue(mockHeader);

		await expect(parseArrayBufferAsNIFTI(arrayBuffer)).rejects.toThrow(
			'Unsupported NIFTI datatype'
		);

		expect(nifti.isCompressed).toHaveBeenCalledWith(arrayBuffer);
		expect(nifti.isNIFTI).toHaveBeenCalledWith(arrayBuffer);
		expect(nifti.readHeader).toHaveBeenCalledWith(arrayBuffer);
	});
});
