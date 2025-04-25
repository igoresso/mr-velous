<script lang="ts">
	import { FileUp } from 'lucide-svelte';
	import { getLoaderState } from '$lib/context/loader.svelte';

	const loader = getLoaderState();

	let isDragOver = false;

	function handleDragOver(event: DragEvent): void {
		event.preventDefault();
		isDragOver = true;
	}

	function handleDragLeave(): void {
		isDragOver = false;
	}

	function getClasses() {
		const base =
			'relative flex flex-col items-center rounded-xl border-2 border-dashed p-10 transition-colors duration-300';
		const light =
			isDragOver && !loader.isLoading
				? 'border-neutral-400 bg-neutral-200'
				: 'border-neutral-200 bg-neutral-50';
		const hoverLight =
			!loader.isLoading && 'hover:border-neutral-400 hover:bg-neutral-200 focus:bg-neutral-200';
		const dark =
			isDragOver && !loader.isLoading
				? 'dark:border-neutral-500 dark:bg-neutral-800'
				: 'dark:border-neutral-700 dark:bg-neutral-900';
		const hoverDark = 'dark:hover:border-neutral-500 dark:hover:bg-neutral-800';
		const accessibility = 'focus-within:ring-4 ring-ring-3 ring-offset-4 ring-offset-background';
		const disabled = loader.isLoading ? 'opacity-50' : '';

		return `${base} ${light} ${hoverLight} ${dark} ${hoverDark} ${accessibility} ${disabled}`;
	}
</script>

<div
	class={getClasses()}
	role="region"
	aria-label="File upload area"
	aria-describedby="file-upload-instructions"
	ondrop={(event) => loader.handleFiles(event)}
>
	<span class="mb-5"><FileUp size={48} aria-hidden="true" /></span>
	<p id="file-upload-instructions" class="mb-1 text-center text-xl font-light">
		<span class="font-semibold">Upload files</span> or drag and drop
	</p>

	<span class="text-muted-foreground italic">{loader.acceptedExtensions}</span>

	<input
		class={`absolute inset-0 opacity-0 ${loader.isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
		type="file"
		accept={loader.acceptedExtensions}
		multiple={loader.multiple}
		aria-label="File input"
		onchange={(event) => loader.handleFiles(event)}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		disabled={loader.isLoading}
	/>
</div>
