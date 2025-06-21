import { getContext, setContext } from 'svelte';
import { zoomIdentity } from 'd3-zoom';
import {
	isBigIntArray,
	computeMinAndMax,
	extractSliceFromVolume,
	vectorToMatrix
} from '$lib/helpers';
import type { Image } from 'itk-wasm';
import type { ZoomTransform } from 'd3-zoom';
import type { NumberTypedArray, View, Volume } from '$lib/types';

enum Axis {
	X = 0,
	Y = 1,
	Z = 2
}

const planeNames = ['SAGITTAL', 'CORONAL', 'AXIAL'];

export class ViewerState {
	volumes = $state<Volume[]>([]);
	views = $state<View[]>([]);
	activeTile = $state<string>('Information');
	referenceImage: Image | null = null;

	addVolume(fileName: string, image: Image): void {
		if (!image.data) {
			throw new Error('The image data is null');
		}

		if (isBigIntArray(image.data)) {
			throw new Error('BigInt arrays are not supported');
		}

		const { min, max } = computeMinAndMax(image.data as NumberTypedArray);
		const newVolume: Volume = {
			id: crypto.randomUUID(),
			fileName: fileName,
			...image,
			data: image.data as NumberTypedArray,
			min,
			max,
			brightnessFactor: 0,
			contrastFactor: 1,
			opacity: 1,
			isActive: true,
			isVisible: true
		};

		this.deactivateAllVolumes();
		this.volumes.unshift(newVolume);

		if (this.volumes.length === 1) {
			this.initViews(newVolume);
		}
	}

	private deactivateAllVolumes(): void {
		this.volumes.forEach((volume) => (volume.isActive = false));
	}

	private initViews(volume: Volume): void {
		const { size, spacing } = volume;
		const axisColors = {
			[Axis.X]: '#f87171',
			[Axis.Y]: '#4ade80',
			[Axis.Z]: '#60a5fa'
		};

		const matrix = vectorToMatrix(volume.direction);

		this.views = [Axis.X, Axis.Y, Axis.Z].map((axis) =>
			this.createView(axis, size, spacing, matrix, axisColors)
		);
	}

	private createView(
		axis: Axis,
		size: number[],
		spacing: number[],
		matrix: number[][],
		axisColors: { [key in Axis]: string }
	): View {
		const currentSlice = Math.floor(size[axis] / 2);

		const { rows, cols, voxelRatio } = this.calculateViewDimensions(axis, size, spacing);

		const plane = this.getDominantAxis(matrix[axis]);
		const planeDirections = this.getPlaneDirections(matrix, axis);
		const planeVectors = this.getPlaneVectors(matrix, axis);

		const transpose = this.shouldTranspose(plane, planeDirections);

		if (transpose) {
			planeDirections.reverse();
			planeVectors.reverse();
		}

		const flipX = planeVectors[0][planeDirections[0]] < 0;
		const flipY =
			planeDirections[1] === Axis.Z
				? planeVectors[1][planeDirections[1]] > 0
				: planeVectors[1][planeDirections[1]] < 0;

		return {
			axis,
			plane: planeNames[plane] as 'AXIAL' | 'CORONAL' | 'SAGITTAL',
			currentSlice,
			slices: size[axis] - 1,
			rows,
			cols,
			voxelRatio,
			color: axisColors[axis],
			transform: zoomIdentity,
			flipX,
			flipY,
			transpose
		};
	}

	private calculateViewDimensions(
		axis: Axis,
		size: number[],
		spacing: number[]
	): { rows: number; cols: number; voxelRatio: number } {
		switch (axis) {
			case Axis.X:
				return {
					rows: size[2],
					cols: size[1],
					voxelRatio: spacing[1] / spacing[2]
				};
			case Axis.Y:
				return {
					rows: size[2],
					cols: size[0],
					voxelRatio: spacing[0] / spacing[2]
				};
			case Axis.Z:
				return {
					rows: size[1],
					cols: size[0],
					voxelRatio: spacing[0] / spacing[1]
				};
		}
	}

	private getDominantAxis(vector: number[]): number {
		return vector.reduce(
			(iMax, val, i, arr) => (Math.abs(val) > Math.abs(arr[iMax]) ? i : iMax),
			0
		);
	}

	private getPlaneDirections(matrix: number[][], axis: Axis): number[] {
		return matrix.filter((_, i) => i !== axis).map((row) => this.getDominantAxis(row));
	}

	private getPlaneVectors(matrix: number[][], axis: Axis): number[][] {
		return matrix.filter((_, i) => i !== axis);
	}

	private shouldTranspose(plane: number, planeDirections: number[]): boolean {
		return (
			(plane === Axis.X && planeDirections[0] === Axis.Z) ||
			(plane === Axis.Y && planeDirections[0] === Axis.Z) ||
			(plane === Axis.Z && planeDirections[0] === Axis.Y)
		);
	}

	getActiveVolume(): Volume | undefined {
		return this.volumes.find((volume) => volume.isActive);
	}

	setActiveVolume(volumeId: string): void {
		if (this.volumes.some((volume) => volume.id === volumeId)) {
			this.volumes.forEach((volume) => {
				volume.isActive = volume.id === volumeId;
			});
		}
	}

	toggleVisibility(volumeId: string): void {
		const volume = this.volumes.find((volume) => volume.id === volumeId);

		if (volume) {
			volume.isVisible = !volume.isVisible;
		}
	}

	removeActiveVolume(): void {
		if (this.volumes.length === 0) return;

		if (this.volumes.length === 1) {
			this.reset();
			return;
		}

		const activeIndex = this.volumes.findIndex((volume) => volume.isActive);
		this.volumes = this.volumes.filter((volume) => !volume.isActive);
		this.volumes[Math.min(activeIndex, this.volumes.length - 1)].isActive = true;
	}

	moveLayer(from: number, to: number): void {
		if (from < 0 || from >= this.volumes.length) {
			throw new Error('Original index is out of bounds');
		}

		if (to < 0 || to >= this.volumes.length) {
			throw new Error('Target index is out of bounds');
		}

		if (from === to) return;

		const volume = this.volumes.splice(from, 1)[0];
		this.volumes.splice(to, 0, volume);
	}

	swapViews(current: number, target: number): void {
		const idxCurrent = this.views.findIndex((view) => view.axis === current);
		const idxTarget = this.views.findIndex((view) => view.axis === target);

		if (idxCurrent !== -1 && idxTarget !== -1) {
			const newViews = [...this.views];

			[newViews[idxCurrent], newViews[idxTarget]] = [newViews[idxTarget], newViews[idxCurrent]];

			this.views = newViews;
		}
	}

	rotateViews(): void {
		if (this.views.length > 0) {
			this.views = [this.views[this.views.length - 1], ...this.views.slice(0, -1)];
		}
	}

	reset(): void {
		this.volumes = [];
		this.views = [];
		this.activeTile = 'Information';
	}

	nextSlice(axis: number): void {
		const view = this.views.find((view) => view.axis === axis);

		if (view) {
			view.currentSlice = Math.min(view.slices, view.currentSlice + 1);
		}
	}

	previousSlice(axis: number): void {
		const view = this.views.find((view) => view.axis === axis);

		if (view) {
			view.currentSlice = Math.max(0, view.currentSlice - 1);
		}
	}

	changeSlice(axis: number, currentSlice: number): void {
		const view = this.views.find((view) => view.axis === axis);

		if (view) {
			view.currentSlice = Math.max(0, Math.min(view.slices, currentSlice));
		}
	}

	getSliceDataForView(axis: number, volumeID: string): NumberTypedArray | null {
		const view = this.views.find((view) => view.axis === axis);
		const volume = this.volumes.find((volume) => volume.id === volumeID);

		if (!view) {
			throw new Error(`View with axis ${axis} not found.`);
		}

		if (!volume) {
			throw new Error(`Volume with ID ${volumeID} not found.`);
		}

		if (!volume.data) {
			return null;
		}

		return extractSliceFromVolume(volume.size, volume.data, view.axis, view.currentSlice);
	}

	setOpacity(opacity: number): void {
		const volume = this.getActiveVolume();

		if (volume) {
			volume.opacity = Math.max(0, Math.min(1, opacity));
		}
	}

	setBrightness(brightness: number): void {
		const volume = this.getActiveVolume();

		if (volume) {
			volume.brightnessFactor = Math.max(-1, Math.min(1, brightness));
		}
	}

	setContrast(contrast: number): void {
		const volume = this.getActiveVolume();

		if (volume) {
			volume.contrastFactor = Math.max(0, Math.min(2, contrast));
		}
	}

	adjustBrightnessAndContrast(brightnessChange: number, contrastChange: number): void {
		const volume = this.getActiveVolume();

		if (volume) {
			volume.brightnessFactor = Math.max(
				-1,
				Math.min(1, volume.brightnessFactor + brightnessChange)
			);
			volume.contrastFactor = Math.max(0, Math.min(2, volume.contrastFactor + contrastChange));
		}
	}

	resetBrightnessAndContrast(): void {
		const volume = this.getActiveVolume();

		if (volume) {
			volume.brightnessFactor = 0;
			volume.contrastFactor = 1;
		}
	}

	setTransform(axis: number, transform: ZoomTransform): void {
		const view = this.views.find((view) => view.axis === axis);

		if (view) {
			view.transform = transform;
		}
	}

	resetTransform(axis: number): void {
		const view = this.views.find((view) => view.axis === axis);

		if (view) {
			view.transform = zoomIdentity;
		}
	}
}

const VIEWER_KEY = Symbol('VIEWER');

export function setViewerState() {
	return setContext(VIEWER_KEY, new ViewerState());
}

export function getViewerState() {
	return getContext<ReturnType<typeof setViewerState>>(VIEWER_KEY);
}
