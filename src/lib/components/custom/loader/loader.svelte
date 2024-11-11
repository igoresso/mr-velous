<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { getViewerState } from '$lib/stores/viewer.svelte';
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { Dropzone } from '$lib/components/custom/dropzone';
	import type {
		niftiReadImage as NiftiReadImageType,
		setPipelinesBaseUrl as setPipelinesBaseUrlType
	} from '@itk-wasm/image-io';
	import type {
		readImageDicomFileSeries as readImageDicomFileSeriesType,
		readDicomTags as readDicomTagsType
	} from '@itk-wasm/dicom';

	let setPipelinesBaseUrl: typeof setPipelinesBaseUrlType;
	let niftiReadImage: typeof NiftiReadImageType;
	let readImageDicomFileSeries: typeof readImageDicomFileSeriesType;
	let readDicomTags: typeof readDicomTagsType;

	if (browser) {
		import('@itk-wasm/image-io').then((module) => {
			({ niftiReadImage, setPipelinesBaseUrl } = module);
			setPipelinesBaseUrl(`${base}/pipelines`);
		});

		import('@itk-wasm/dicom').then((module) => {
			({ readImageDicomFileSeries, readDicomTags } = module);
		});
	}

	const viewerState = getViewerState();

	let isLoading = $state(false);

	async function handleFiles(event: CustomEvent<File[]>) {
		if (!browser) return;

		const files = event.detail;

		if (!files || files.length === 0) {
			return;
		}

		isLoading = true;
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
				const { image } = await niftiReadImage(file);
				viewerState.addVolume(file.name, image);
				toast.success(`File loaded successfully`, { description: file.name, class: 'break-all' });

				if (files.length > 0) {
					toast.warning('Multiple studies detected', {
						description: 'Only files from the same study will be loaded'
					});
					return;
				}
			} catch (error) {
				if (error instanceof Error) {
					toast.error(`Error adding file`, { description: error.message });
				} else {
					toast.error(`Error adding file`, { description: 'An unknown error occurred.' });
				}
			}
		} else if (firstFile.name.endsWith('.dcm')) {
			const { webWorker, tags } = await readDicomTags(firstFile, {
				tagsToRead: { tags: ['0020|000d', '0008|103e'] }
			});

			const studyName = tags.find((tag) => tag[0] === '0008|103e')?.[1] || 'Unknown Study';
			const studyRefUID = tags.find((tag) => tag[0] === '0020|000d')?.[1];

			const filesFiltered = [];
			let filteredCount = 0;

			for (const file of files) {
				const { tags } = await readDicomTags(file, {
					webWorker,
					tagsToRead: { tags: ['0020|000d'] }
				});

				const studyUID = tags.find((tag) => tag[0] === '0020|000d')?.[1];

				if (studyUID === studyRefUID) {
					filesFiltered.push(file);
				} else {
					filteredCount++;
				}
			}

			if (filteredCount > 0) {
				toast.warning('Multiple studies detected', {
					description: 'Only files from the same study will be loaded'
				});
			}

			try {
				const { outputImage } = await readImageDicomFileSeries({ inputImages: filesFiltered });
				viewerState.addVolume(studyName, outputImage);
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

		isLoading = false;
		toast.dismiss('loading-toast');
	}

	function handleUnsupported(event: CustomEvent<{ entry: string; type: 'file' | 'folder' }[]>) {
		const entries = event.detail;

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
</script>

<div class="grid h-full place-content-center p-5">
	<Dropzone
		acceptedExtensions=".dcm, .nii, .nii.gz"
		multiple={true}
		acceptFolders={true}
		isDisabled={isLoading}
		on:filesDropped={handleFiles}
		on:unsupported={handleUnsupported}
		on:error={(event) => toast.error(event.detail)}
	/>
</div>
