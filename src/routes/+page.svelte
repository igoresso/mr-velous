<svelte:options runes={true} />

<script lang="ts">
	import { getCollectionState } from '$lib/collection-state.svelte';
	import { toast } from 'svelte-sonner';
	import { processFile } from '$lib/helpers';
	import { Dropzone } from '$lib/components/dropzone';

	const collectionState = getCollectionState();

	async function handleFiles(event: CustomEvent<FileList>) {
		for (const file of event.detail) {
			try {
				const dataset = await processFile(file);
				collectionState.add(file.name, dataset);
			} catch (error) {
				if (error instanceof Error) {
					toast.error(`Error adding file`, { description: error.message });
				} else {
					toast.error(`Error adding file`, { description: 'An unknown error occurred.' });
				}
			}
		}
	}

	function handleUnsupportedFiles(event: CustomEvent<string[]>) {
		const files = event.detail;

		files.forEach((file) => {
			toast.error(`Unsupported filetype`, { description: `File: ${file}` });
		});
	}
</script>

<div class="grid h-full place-content-center">
	{#if collectionState.collection.length > 0}
		<h1 class="text-2xl font-bold">Views</h1>
	{:else}
		<Dropzone
			acceptedExtensions=".nii, .nii.gz"
			multiple={false}
			on:filesDropped={handleFiles}
			on:unsupportedFiles={handleUnsupportedFiles}
		/>
	{/if}
</div>
