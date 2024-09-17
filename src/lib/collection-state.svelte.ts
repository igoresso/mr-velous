import { getContext, setContext } from 'svelte';
import type { Dataset, Entry, View } from './types';

export class CollectionState {
	collection = $state<Entry[]>([]);

	// Add method that accepts a File and returns a Promise
	add(fileName: string, dataset: Dataset): void {
		try {
			const id = crypto.randomUUID();

			const views = $state<View[]>([
				{
					id: crypto.randomUUID(),
					axis: 0,
					slice: Math.floor(dataset.header.dims[3] / 2),
					rows: dataset.header.dims[1],
					cols: dataset.header.dims[2],
					fov: [
						dataset.header.dims[1] * dataset.header.pixDims[1],
						dataset.header.dims[2] * dataset.header.pixDims[2]
					],
					voxelRatio: dataset.header.pixDims[1] / dataset.header.pixDims[2]
				}
			]);

			this.collection.push({
				...dataset,
				id,
				fileName,
				views
			});
		} catch (error) {
			throw new Error(`Failed to add dataset: ${fileName}`, { cause: error });
		}
	}

	getViews(entryId: string): View[] | undefined {
		const entry = this.collection.find((item) => item.id === entryId);
		return entry ? entry.views : undefined;
	}

	remove(id: string) {
		this.collection = this.collection.filter((view) => view.id !== id);
	}
}

const COLLECTION_KEY = Symbol('COLLECTION');

export function setCollectionState() {
	return setContext(COLLECTION_KEY, new CollectionState());
}

export function getCollectionState() {
	return getContext<ReturnType<typeof setCollectionState>>(COLLECTION_KEY);
}
