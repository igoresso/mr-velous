import { describe, it, expect } from 'vitest';
import { sliceDataToImageArray } from './sliceDataToImageArray';

describe('sliceDataToImageArray', () => {
	it('converts sliceData to Uint8ClampedArray without adjustments', () => {
		const sliceData = new Uint8Array([0, 127, 255]);
		const rows = 1;
		const cols = 3;
		const min = 0;
		const max = 255;

		const result = sliceDataToImageArray(sliceData, rows, cols, min, max);

		const expectedData = new Uint8ClampedArray([
			0,
			0,
			0,
			255, // Pixel 1: 0
			127,
			127,
			127,
			255, // Pixel 2: 127
			255,
			255,
			255,
			255 // Pixel 3: 255
		]);

		expect(result).toEqual(expectedData);
	});

	it('applies brightness and contrast adjustments correctly', () => {
		const sliceData = new Uint8Array([64, 128, 192]);
		const rows = 1;
		const cols = 3;
		const min = 0;
		const max = 255;
		const brightnessFactor = 0.5; // Adjusts brightness by +127.5
		const contrastFactor = 2; // Doubles the contrast

		const result = sliceDataToImageArray(
			sliceData,
			rows,
			cols,
			min,
			max,
			brightnessFactor,
			contrastFactor
		);

		const expectedData = new Uint8ClampedArray([
			255,
			255,
			255,
			255, // Pixel 1: 255
			255,
			255,
			255,
			255, // Pixel 2: 255
			255,
			255,
			255,
			255 // Pixel 3: 255
		]);

		expect(result).toEqual(expectedData);
	});

	it('handles min equal to max by resetting min and max', () => {
		const sliceData = new Uint8Array([5, 5, 5]);
		const rows = 1;
		const cols = 3;
		const min = 5;
		const max = 5;

		const result = sliceDataToImageArray(sliceData, rows, cols, min, max);

		const expectedData = new Uint8ClampedArray([
			0,
			0,
			0,
			255, // Pixel 1: 0
			0,
			0,
			0,
			255, // Pixel 2: 0
			0,
			0,
			0,
			255 // Pixel 3: 0
		]);

		expect(result).toEqual(expectedData);
	});

	it('works with different TypedArray types', () => {
		const sliceData = new Float32Array([0.0, 0.5, 1.0]);
		const rows = 1;
		const cols = 3;
		const min = 0.0;
		const max = 1.0;

		const result = sliceDataToImageArray(sliceData, rows, cols, min, max);

		const expectedData = new Uint8ClampedArray([
			0,
			0,
			0,
			255, // Pixel 1: 0
			128,
			128,
			128,
			255, // Pixel 2: 128
			255,
			255,
			255,
			255 // Pixel 3: 255
		]);

		expect(result).toEqual(expectedData);
	});

	it('handles opacity correctly', () => {
		const sliceData = new Uint8Array([100, 150, 200]);
		const rows = 1;
		const cols = 3;
		const min = 0;
		const max = 255;
		const opacity = 0.5; // 50% opacity

		const result = sliceDataToImageArray(sliceData, rows, cols, min, max, 0, 1, opacity);

		const expectedData = new Uint8ClampedArray([
			100,
			100,
			100,
			128, // Pixel 1: 100, opacity 128
			150,
			150,
			150,
			128, // Pixel 2: 150, opacity 128
			200,
			200,
			200,
			128 // Pixel 3: 200, opacity 128
		]);

		expect(result).toEqual(expectedData);
	});

	it('clamps brightness and contrast correctly', () => {
		const sliceData = new Uint8Array([64, 128, 192]);
		const rows = 1;
		const cols = 3;
		const min = 0;
		const max = 255;
		const brightnessFactor = -1.5; // Exceeds min allowed value, clamps to -1
		const contrastFactor = 3.5; // Exceeds max allowed value, clamps to 3

		const result = sliceDataToImageArray(
			sliceData,
			rows,
			cols,
			min,
			max,
			brightnessFactor,
			contrastFactor
		);

		const expectedData = new Uint8ClampedArray([
			0,
			0,
			0,
			255, // Pixel 1: 0
			0,
			0,
			0,
			255, // Pixel 2: 0
			0,
			0,
			0,
			255 // Pixel 3: 0
		]);

		expect(result).toEqual(expectedData);
	});

	it('throws error for mismatched rows and cols', () => {
		const sliceData = new Uint8Array([1, 2, 3, 4, 5]);
		const rows = 2;
		const cols = 2;
		const min = 0;
		const max = 255;

		expect(() => {
			sliceDataToImageArray(sliceData, rows, cols, min, max);
		}).toThrow('Data length and image dimensions mismatch');
	});
});
