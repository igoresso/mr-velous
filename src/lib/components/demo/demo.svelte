<svelte:options runes={true} />

<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Telescope } from 'lucide-svelte';
	import { loadFileFromURL } from '$lib/helpers';
	import { Button } from '$lib/components/ui/button';
	import { base } from '$app/paths';
	import { getViewerState } from '$lib/viewer-state.svelte';

	const viewerState = getViewerState();

	async function loadDemo() {
		const fileName = 'pineaple.nii.gz';
		const url = `${base}/${fileName}`;

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
	}
</script>

<Button onclick={loadDemo}>
	<Telescope class="mr-2 h-4 w-4" />
	Explore a demo
</Button>
