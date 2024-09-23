import type { TypedArray } from '$lib/types';

export function sliceDataToImageData(
	sliceData: TypedArray,
	rows: number,
	cols: number,
	min: number,
	max: number
): ImageData {
	const imageDataArray = new Uint8ClampedArray(rows * cols * 4);

	// Handle the case where all values are the same
	if (min === max) {
		min = 0;
		max = 1;
	}

	for (let i = 0; i < sliceData.length; i++) {
		const value: number = sliceData[i];
		const normalized = ((value - min) / (max - min)) * 255;
		const intensity = Math.round(normalized);

		const index = i * 4;
		imageDataArray[index] = intensity;
		imageDataArray[index + 1] = intensity;
		imageDataArray[index + 2] = intensity;
		imageDataArray[index + 3] = 255;
	}

	return new ImageData(imageDataArray, cols, rows);
}
