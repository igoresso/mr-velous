<svelte:options runes={true} />

<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Dropzone } from '$lib/components/dropzone';

	function handleFiles(event: CustomEvent<FileList>) {
		console.log(event.detail);
	}

	function handleUnsupportedFiles(event: CustomEvent<string[]>) {
		const files = event.detail;

		files.forEach((file) => {
			toast.error(`Unsupported filetype`, { description: `File: ${file}` });
		});
	}
</script>

<div class="grid h-full place-content-center">
	<Dropzone
		acceptedExtensions=".nii, .nii.gz"
		multiple={false}
		on:filesDropped={handleFiles}
		on:unsupportedFiles={handleUnsupportedFiles}
	/>
</div>
