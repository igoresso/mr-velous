<svelte:options runes={true} />

<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { LoaderCircle, Telescope } from 'lucide-svelte';
	import { loadFileFromURL } from '$lib/helpers';
	import { Button } from '$lib/components/ui/button';
	import { base } from '$app/paths';
	import { getViewerState } from '$lib/viewer-state.svelte';

	const viewerState = getViewerState();

	let isLoading = $state(false);

	async function loadDemo() {
		const fileName = 'pineaple.nii.gz';
		const url = `${base}/${fileName}`;

		isLoading = true;

		try {
			const dataset = await loadFileFromURL(url);
			viewerState.addVolume(fileName, dataset);
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
