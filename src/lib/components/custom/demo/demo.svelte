<svelte:options runes={true} />

<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { getViewerState } from '$lib/viewer-state.svelte';
	import { LoaderCircle, Telescope } from 'lucide-svelte';
	import { base } from '$app/paths';
	import { loadFileFromURL } from '$lib/helpers';
	import { Button } from '$lib/components/ui/button';
	import type { niftiReadImage as NiftiReadImageType } from '@itk-wasm/image-io';

	let niftiReadImage: typeof NiftiReadImageType;

	const viewerState = getViewerState();

	let isLoading = $state(false);

	async function loadImageReaders() {
		const { setPipelinesBaseUrl, ...module } = await import('@itk-wasm/image-io');
		setPipelinesBaseUrl(`${base}/pipelines`);
		niftiReadImage = module.niftiReadImage;
	}

	$effect(() => {
		loadImageReaders();
	});

	async function loadDemo() {
		const fileName = 'pineaple.nii.gz';
		const url = `${base}/${fileName}`;

		isLoading = true;

		try {
			const blob = await loadFileFromURL(url);
			const file = new File([blob], fileName);
			const { image } = await niftiReadImage(file);
			viewerState.addVolume(fileName, image);
			toast.success(`File loaded successfully`, { description: fileName });
		} catch (error) {
			if (error instanceof Error) {
				toast.error(`Error adding file`, { description: error.message });
			} else {
				toast.error(`Error adding file`, { description: 'An unknown error occurred.' });
			}
		}

		isLoading = false;
	}
</script>

<Button onclick={loadDemo} disabled={isLoading}>
	{#if isLoading}
		<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
	{:else}
		<Telescope class="mr-2 h-4 w-4" />
	{/if}
	Explore a demo
</Button>
