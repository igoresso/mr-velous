import { getContext, setContext } from 'svelte';
import { zoomIdentity } from 'd3-zoom';
import { isBigIntArray, computeMinAndMax, extractSliceFromVolume } from '$lib/helpers';
import type { Image } from 'itk-wasm';
import type { ZoomTransform } from 'd3-zoom';
import type { NumberTypedArray, View, Volume } from '$lib/types';

enum Axis {
	X = 0,
	Y = 1,
	Z = 2
}

export class ViewerState {
	volumes = $state<Volume[]>([]);
	views = $state<View[]>([]);
	activeTile = $state<string>('Information');

	addVolume(fileName: string, image: Image): void {
		if (!image.data) {
			throw new Error('The image data is null');
		}

		if (isBigIntArray(image.data)) {
			throw new Error('BigInt arrays are not supported');
		}

		const { min, max } = computeMinAndMax(image.data as NumberTypedArray);

		this.volumes.forEach((volume) => {
			volume.isActive = false;
		});

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

		this.volumes.push(newVolume);

		if (this.volumes.length === 1) {
			this.initViews(newVolume);
		}
	}

	private initViews(volume: Volume): void {
		const { size, spacing } = volume;

		const axisColors = {
			[Axis.X]: '#f87171',
			[Axis.Y]: '#4ade80',
			[Axis.Z]: '#60a5fa'
		};

		this.views = [Axis.X, Axis.Y, Axis.Z].map((axis) => {
			const currentSlice = Math.floor(size[axis] / 2);
			const rows = axis === Axis.X ? size[2] : axis === Axis.Y ? size[2] : size[1];
			const cols = axis === Axis.X ? size[1] : axis === Axis.Y ? size[0] : size[0];
			const voxelRatio =
				axis === Axis.X
					? spacing[1] / spacing[2]
					: axis === Axis.Y
						? spacing[0] / spacing[2]
						: spacing[0] / spacing[1];

			return {
				axis,
				currentSlice,
				slices: size[axis] - 1,
				rows,
				cols,
				voxelRatio,
				color: axisColors[axis],
				transform: zoomIdentity
			};
		});

		this.activeTile = 'Settings';
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

	removeVolume(volumeId: string): void {
		this.volumes = this.volumes.filter((volume) => volume.id !== volumeId);

		if (this.volumes.length === 0) {
			this.views = [];
			this.activeTile = 'Information';
		}
	}

	swapViews(current: number, target: number): void {
		const idxCurrent = this.views.findIndex((view) => view.axis === current);
		const idxTarget = this.views.findIndex((view) => view.axis === target);

		if (idxCurrent !== -1 && idxTarget !== -1) {
			const curreView = this.views[idxCurrent];
			this.views[idxCurrent] = this.views[idxTarget];
			this.views[idxTarget] = curreView;
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
		const volume = this.volumes.find((volume) => volume.isActive);

		if (volume) {
			volume.opacity = Math.max(0, Math.min(1, opacity));
		}
	}

	setBrightness(brightness: number): void {
		const volume = this.volumes.find((volume) => volume.isActive);

		if (volume) {
			volume.brightnessFactor = Math.max(-1, Math.min(1, brightness));
		}
	}

	setContrast(contrast: number): void {
		const volume = this.volumes.find((volume) => volume.isActive);

		if (volume) {
			volume.contrastFactor = Math.max(0, Math.min(2, contrast));
		}
	}

	adjustBrightnessAndContrast(brightnessChange: number, contrastChange: number): void {
		const volume = this.volumes.find((volume) => volume.isActive);

		if (volume) {
			volume.brightnessFactor = Math.max(
				-1,
				Math.min(1, volume.brightnessFactor + brightnessChange)
			);
			volume.contrastFactor = Math.max(0, Math.min(2, volume.contrastFactor + contrastChange));
		}
	}

	resetBrightnessAndContrast(): void {
		const volume = this.volumes.find((volume) => volume.isActive);

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
