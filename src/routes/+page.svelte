<svelte:options runes={true} />

<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Dropzone } from '$lib/components/dropzone';
	import { Panel } from '$lib/components/panel';
	import { getViewerState } from '$lib/viewer-state.svelte';

	const viewerState = getViewerState();

	async function handleFiles(event: CustomEvent<FileList>) {
		for (const file of event.detail) {
			try {
				viewerState.addVolume(file);
			} catch (error) {
				if (error instanceof Error) {
					toast.error(`Error adding file`, { description: error.message });
				} else {
					toast.error(`Error adding file`, { description: 'An unknown error occurred.' });
				}
			}

			toast.success(`File loaded successfully`, { description: file.name, class: 'break-all' });
		}
	}

	function handleUnsupportedFiles(event: CustomEvent<string[]>) {
		const files = event.detail;

		files.forEach((file) => {
			console.log(file);
			toast.error(`Unsupported filetype`, { description: `File: ${file}`, class: 'break-all' });
		});
	}
</script>

{#if viewerState.volumes.length === 0}
	<div class="grid h-full place-content-center">
		<Dropzone
			acceptedExtensions=".nii, .nii.gz"
			multiple={false}
			on:filesDropped={handleFiles}
			on:unsupportedFiles={handleUnsupportedFiles}
		/>
	</div>
{:else}
	<div class="grid h-full grid-cols-2 gap-3">
		{#each viewerState.views as view}
			<Panel {view} />
		{/each}
	</div>
{/if}
