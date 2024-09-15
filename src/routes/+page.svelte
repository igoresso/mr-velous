<svelte:options runes={true} />

<script lang="ts">
	import { Dropzone } from '$lib/components/dropzone';

	function handleFiles(event: CustomEvent<FileList>) {
		console.log(event.detail);
	}

	function handleUnsupportedFiles(event: CustomEvent<string[]>) {
		console.warn('Some files are unsupported:', event.detail);
		console.log(event.detail);
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
