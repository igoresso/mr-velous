import { getContext, setContext } from 'svelte';
import { toast } from 'svelte-sonner';
import { browser } from '$app/environment';
import { base } from '$app/paths';
import { ViewerState } from '$lib/context/viewer.svelte';
import { loadFileFromURL } from '$lib/helpers';
import { InterfaceTypes, WorkerPool } from 'itk-wasm';
import type {
	setPipelinesBaseUrl as SetPipelinesBaseUrlType,
	runPipeline as RunPipelineType,
	PipelineInput,
	PipelineOutput,
	Image
} from 'itk-wasm';
import type { niftiReadImage as NiftiReadImageType } from '@itk-wasm/image-io';
import type {
	readImageDicomFileSeries as ReadImageDicomFileSeriesType,
	readDicomTags as ReadDicomTagsType
} from '@itk-wasm/dicom';

let setPipelinesBaseUrl: typeof SetPipelinesBaseUrlType;
let runPipeline: typeof RunPipelineType;
let niftiReadImage: typeof NiftiReadImageType;
let readImageDicomFileSeries: typeof ReadImageDicomFileSeriesType;
let readDicomTags: typeof ReadDicomTagsType;

if (browser) {
	import('itk-wasm').then((module) => {
		({ setPipelinesBaseUrl, runPipeline } = module);
		setPipelinesBaseUrl(`${base}/pipelines`);
	});

	import('@itk-wasm/image-io').then((module) => {
		({ niftiReadImage, setPipelinesBaseUrl } = module);
	});

	import('@itk-wasm/dicom').then((module) => {
		({ readImageDicomFileSeries, readDicomTags } = module);
	});
}

export class LoaderState {
	worker: Worker | null = null;
	workerPool: WorkerPool | null = null;
	viewer: ViewerState;
	isLoading = $state(false);
	files = $state<File[]>([]);
	acceptedExtensions = '.dcm, .nii, .nii.gz';
	multiple = true;
	acceptFolders = true;
	maxImages = 5;

	constructor(viewer: ViewerState) {
		this.viewer = viewer;
	}

	async handleFiles(event: Event | DragEvent): Promise<void> {
		event.preventDefault();

		let files: File[] = [];
		const unsupported: { entry: string; type: 'file' | 'folder' }[] = [];

		if (event instanceof DragEvent) {
			const items = event.dataTransfer?.items;
			if (items) {
				const result = await this.readFilesFromItems(items, this.acceptFolders);
				files = result.files;
				unsupported.push(...result.unsupported);
			}
		} else if (event.target instanceof HTMLInputElement) {
			files = event.target.files ? Array.from(event.target.files) : [];
			event.target.value = '';
		}

		if (this.viewer.volumes.length >= this.maxImages) {
			toast.error('Maximum number of volumes reached');
			return;
		}

		if (!files.length && !unsupported.length) return;

		if (!this.multiple && files.length > 1) {
			toast.error('Multiple files are not allowed');
			return;
		}

		const { files: filteredFiles, unsupported: unsupportedFiles } =
			this.filterFilesByExtension(files);
		unsupported.push(...unsupportedFiles);

		if (filteredFiles.length) {
			this.loadFiles(filteredFiles);
		}

		if (unsupported.length) {
			this.handleUnsupported(unsupported);
		}
	}

	async loadDemo(): Promise<void> {
		const fileName = 'pineaple.nii.gz';
		const url = `${base}/examples/${fileName}`;

		try {
			const blob = await loadFileFromURL(url);
			const file = new File([blob], fileName);
			this.loadFiles([file]);
		} catch (error) {
			if (error instanceof Error) {
				toast.error(`Error adding file`, { description: error.message });
			} else {
				toast.error(`Error adding file`, { description: 'An unknown error occurred.' });
			}
		}
	}

	private handleUnsupported(entries: { entry: string; type: 'file' | 'folder' }[]) {
		entries.forEach((entry) => {
			if (entry.type === 'file') {
				toast.error(`Unsupported filetype`, {
					description: `File: ${entry.entry}`,
					class: 'break-all'
				});
			} else if (entry.type === 'folder') {
				toast.error(`Folders are not allowed`, {
					description: `Folder: ${entry.entry}`,
					class: 'break-all'
				});
			}
		});
	}

	private async loadFiles(files: File[]) {
		if (!browser) return;

		if (!files || files.length === 0) {
			return;
		}

		this.isLoading = true;
		toast.loading('Processing files...', {
			duration: Infinity,
			id: 'loading-toast'
		});

		const firstFile = files[0];

		if (firstFile.name.endsWith('.nii') || firstFile.name.endsWith('.nii.gz')) {
			const file = files.shift();

			if (!file) {
				return;
			}

			try {
				const { image, webWorker } = await niftiReadImage(file, { webWorker: this.worker });
				this.worker = webWorker;
				if (this.viewer.volumes.length === 0) {
					this.viewer.addVolume(file.name, image);
					this.viewer.referenceImage = image;
				} else {
					const resampledImage = await this.resampleImageToReference(image);
					this.viewer.addVolume(file.name, resampledImage);
				}
				toast.success(`File loaded successfully`, { description: file.name, class: 'break-all' });
			} catch (error) {
				if (error instanceof Error) {
					toast.error(`Error adding file`, { description: error.message });
				} else {
					toast.error(`Error adding file`, { description: 'An unknown error occurred.' });
				}
			}
		} else if (firstFile.name.endsWith('.dcm')) {
			const { tags, webWorker } = await readDicomTags(firstFile, {
				tagsToRead: { tags: ['0020|000d', '0008|103e'] }
			});

			this.worker = webWorker;

			const studyName = tags.find((tag) => tag[0] === '0008|103e')?.[1] || 'Unknown Study';
			const studyRefUID = tags.find((tag) => tag[0] === '0020|000d')?.[1];

			const filesFiltered = [];

			for (const file of files) {
				const { tags, webWorker } = await readDicomTags(file, {
					webWorker: this.worker,
					tagsToRead: { tags: ['0020|000d'] }
				});

				this.worker = webWorker;

				const studyUID = tags.find((tag) => tag[0] === '0020|000d')?.[1];

				if (studyUID === studyRefUID) {
					filesFiltered.push(file);
				}
			}

			try {
				const { outputImage, webWorkerPool } = await readImageDicomFileSeries({
					inputImages: filesFiltered,
					webWorkerPool: this.workerPool
				});
				this.workerPool = webWorkerPool;
				this.viewer.addVolume(studyName, outputImage);
				toast.success(`Study loaded successfully`, {
					description: studyName,
					class: 'break-all'
				});
			} catch (error) {
				if (error instanceof Error) {
					toast.error(`Error adding file`, { description: error.message });
				} else {
					toast.error(`Error adding file`, { description: 'An unknown error occurred.' });
				}
			}
		}

		this.isLoading = false;
		toast.dismiss('loading-toast');
	}

	private filterFilesByExtension(files: File[]): {
		files: File[];
		unsupported: { entry: string; type: 'file' }[];
	} {
		if (!this.acceptedExtensions) return { files, unsupported: [] };

		const allowedExtensions = this.acceptedExtensions
			.split(',')
			.map((ext) => ext.trim().toLowerCase());

		const unsupportedFiles: { entry: string; type: 'file' }[] = [];
		const filteredFiles = files.filter((file) => {
			const isValid = allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
			if (!isValid) {
				unsupportedFiles.push({ entry: file.name, type: 'file' });
			}
			return isValid;
		});

		return { files: filteredFiles, unsupported: unsupportedFiles };
	}

	private async readFilesFromItems(
		items: DataTransferItemList,
		acceptFolders: boolean
	): Promise<{
		files: File[];
		unsupported: { entry: string; type: 'file' | 'folder' }[];
	}> {
		const files: File[] = [];
		const unsupported: { entry: string; type: 'file' | 'folder' }[] = [];
		const promises: Promise<void>[] = [];

		for (const item of items) {
			const entry = item.webkitGetAsEntry?.();
			if (entry) {
				if (entry.isFile) {
					promises.push(
						this.readFile(entry as FileSystemFileEntry)
							.then((file) => {
								files.push(file);
							})
							.catch(() => {
								unsupported.push({ entry: entry.name, type: 'file' });
							})
					);
				} else if (entry.isDirectory) {
					if (acceptFolders) {
						promises.push(
							this.readDirectory(entry as FileSystemDirectoryEntry)
								.then((dirFiles) => {
									files.push(...dirFiles);
								})
								.catch(() => {
									unsupported.push({ entry: entry.name, type: 'folder' });
								})
						);
					} else {
						unsupported.push({ entry: entry.name, type: 'folder' });
					}
				}
			} else {
				const file = item.getAsFile();
				if (file) files.push(file);
			}
		}

		await Promise.all(promises);

		return { files, unsupported };
	}

	private async readFile(entry: FileSystemFileEntry): Promise<File> {
		return new Promise((resolve, reject) => {
			entry.file(resolve, reject);
		});
	}

	private async readDirectory(entry: FileSystemDirectoryEntry): Promise<File[]> {
		const files: File[] = [];
		const dirReader = entry.createReader();

		const readEntries = async (): Promise<void> => {
			const entries = await new Promise<FileSystemEntry[]>((resolve, reject) => {
				dirReader.readEntries(resolve, reject);
			});

			if (!entries.length) return;

			const entryPromises: Promise<void>[] = entries.map((e) => {
				if (e.isFile) {
					return this.readFile(e as FileSystemFileEntry)
						.then((file) => {
							files.push(file);
						})
						.catch(() => {
							toast.error(`Error reading file`, {
								description: `${e.name}`,
								class: 'break-all'
							});
						});
				} else if (e.isDirectory) {
					return this.readDirectory(e as FileSystemDirectoryEntry)
						.then((dirFiles) => {
							files.push(...dirFiles);
						})
						.catch(() => {
							toast.error(`Error reading directory`, {
								description: `${e.name}`,
								class: 'break-all'
							});
						});
				} else {
					return Promise.resolve();
				}
			});

			await Promise.all(entryPromises);
			await readEntries();
		};

		await readEntries();
		return files;
	}

	private async resampleImageToReference(image: Image): Promise<Image> {
		const args = ['0', '1', '0', '--memory-io'];

		const inputs: Array<PipelineInput> = [
			{
				type: InterfaceTypes.Image,
				data: image
			},
			{
				type: InterfaceTypes.Image,
				data: this.viewer.referenceImage
			}
		];

		const outputs: Array<PipelineOutput> = [
			{
				type: InterfaceTypes.Image
			}
		];

		const result = await runPipeline('resample-image-to-reference', args, outputs, inputs, {
			webWorker: this.worker
		});

		if (result.returnValue !== 0) {
			throw new Error(result.stderr || 'Pipeline failed with non-zero return code');
		}

		return result.outputs[0].data as Image;
	}
}

const LOADER_KEY = Symbol('LOADER');

export function setLoaderState(viewer: ViewerState) {
	return setContext(LOADER_KEY, new LoaderState(viewer));
}

export function getLoaderState() {
	return getContext<ReturnType<typeof setLoaderState>>(LOADER_KEY);
}
