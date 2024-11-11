<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { getViewerState } from '$lib/stores/viewer.svelte';
	import { LoaderCircle, Telescope } from 'lucide-svelte';
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { loadFileFromURL } from '$lib/helpers';
	import { Button } from '$lib/components/ui/button';
	import type {
		niftiReadImage as NiftiReadImageType,
		setPipelinesBaseUrl as setPipelinesBaseUrlType
	} from '@itk-wasm/image-io';

	let setPipelinesBaseUrl: typeof setPipelinesBaseUrlType;
	let niftiReadImage: typeof NiftiReadImageType;

	if (browser) {
		import('@itk-wasm/image-io').then((module) => {
			({ niftiReadImage, setPipelinesBaseUrl } = module);
			setPipelinesBaseUrl(`${base}/pipelines`);
		});
	}

	const viewerState = getViewerState();

	let isLoading = $state(false);

	async function loadDemo() {
		if (!browser) return;

		const fileName = 'pineaple.nii.gz';
		const url = `${base}/examples/${fileName}`;

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

<Button class="ring-offset-2" onclick={loadDemo} disabled={isLoading}>
	{#if isLoading}
		<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
	{:else}
		<Telescope class="mr-2 h-4 w-4" />
	{/if}
	Explore a demo
</Button>
