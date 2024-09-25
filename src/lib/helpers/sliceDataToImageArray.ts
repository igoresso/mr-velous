import type { TypedArray } from '$lib/types';

export function sliceDataToImageArray(
	sliceData: TypedArray,
	rows: number,
	cols: number,
	min: number,
	max: number,
	brightnessFactor: number = 0,
	contrastFactor: number = 1,
	opacity: number = 1
): Uint8ClampedArray {
	const expectedLength = rows * cols;

	if (sliceData.length !== expectedLength) {
		throw new Error('Data length and image dimensions mismatch');
	}

	const imageDataArray = new Uint8ClampedArray(rows * cols * 4);

	brightnessFactor = Math.max(-1, Math.min(brightnessFactor, 1));
	contrastFactor = Math.max(0, Math.min(contrastFactor, 3));
	opacity = Math.max(0, Math.min(opacity, 1));

	const range = min === max ? 1 : max - min;
	const opacityValue = Math.round(Math.max(0, Math.min(opacity, 1)) * 255);

	for (let i = 0; i < sliceData.length; i++) {
		const normalized = ((sliceData[i] - min) / range) * 255 + brightnessFactor * 255;
		const intensity = Math.round((normalized - 128) * contrastFactor + 128);

		const clampedIntensity = Math.max(0, Math.min(intensity, 255));
		const index = i * 4;

		imageDataArray[index] = clampedIntensity;
		imageDataArray[index + 1] = clampedIntensity;
		imageDataArray[index + 2] = clampedIntensity;
		imageDataArray[index + 3] = opacityValue;
	}

	return imageDataArray;
}
