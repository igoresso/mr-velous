import { describe, it, expect, vi, afterEach, type Mock } from 'vitest';
import { processFile } from './processFile';
import { readFileAsArrayBuffer } from './readFileAsArrayBuffer';
import { parseArrayBufferAsNIFTI } from './parseArrayBufferAsNIFTI';

vi.mock('./readFileAsArrayBuffer');
vi.mock('./parseArrayBufferAsNIFTI');

describe('processFile', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should process the file successfully', async () => {
		const mockFile = new File([], 'test.nii');
		const mockArrayBuffer = new ArrayBuffer(8);
		const mockDataset = {
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
			},
			data: new Int16Array(mockArrayBuffer)
		};

		(readFileAsArrayBuffer as Mock).mockResolvedValue(mockArrayBuffer);
		(parseArrayBufferAsNIFTI as Mock).mockResolvedValue(mockDataset);

		const result = await processFile(mockFile);

		expect(readFileAsArrayBuffer).toHaveBeenCalledWith(mockFile);
		expect(parseArrayBufferAsNIFTI).toHaveBeenCalledWith(mockArrayBuffer);
		expect(result).toEqual(mockDataset);
	});

	it('should throw an error if readFileAsArrayBuffer fails', async () => {
		const mockFile = new File([], 'test.nii');
		const mockError = new Error('Failed to read file');

		(readFileAsArrayBuffer as Mock).mockRejectedValue(mockError);

		await expect(processFile(mockFile)).rejects.toThrow('Failed to read file');

		expect(readFileAsArrayBuffer).toHaveBeenCalledWith(mockFile);
		expect(parseArrayBufferAsNIFTI).not.toHaveBeenCalled();
	});

	it('should throw an error if parseArrayBufferAsNIFTI fails', async () => {
		const mockFile = new File([], 'test.nii');
		const mockArrayBuffer = new ArrayBuffer(8);
		const mockError = new Error('Invalid NIFTI file');

		(readFileAsArrayBuffer as Mock).mockResolvedValue(mockArrayBuffer);
		(parseArrayBufferAsNIFTI as Mock).mockRejectedValue(mockError);

		await expect(processFile(mockFile)).rejects.toThrow('Invalid NIFTI file');

		expect(readFileAsArrayBuffer).toHaveBeenCalledWith(mockFile);
		expect(parseArrayBufferAsNIFTI).toHaveBeenCalledWith(mockArrayBuffer);
	});
});
