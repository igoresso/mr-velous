<script lang="ts">
	import { scale } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { getViewerState } from '$lib/context/viewer.svelte';
	import FileUpIcon from '@lucide/svelte/icons/file-up';
	import { getLoaderState } from '$lib/context/loader.svelte';

	const loader = getLoaderState();
	const viewerState = getViewerState();

	let isDragOver = $state(false);
	let dropzoneRef: HTMLDivElement;
	let dragCounter = 0;

	function handleWindowDragOver(event: DragEvent): void {
		const items = Array.from(event.dataTransfer?.items ?? []);
		const hasFiles = items.some((i) => i.kind === 'file');

		if (!hasFiles) return;

		const { left, top, right, bottom } = dropzoneRef.getBoundingClientRect();
		const { clientX: x, clientY: y } = event;

		if (x >= left && x <= right && y >= top && y <= bottom) {
			event.preventDefault();
			isDragOver = true;
		} else {
			isDragOver = false;
		}
	}

	function handleWindowDrop(event: DragEvent) {
		if (!isDragOver) return;
		event.preventDefault();
		isDragOver = false;
		loader.handleFiles(event);
	}

	function handleWindowDragLeave(event: DragEvent) {
		if (event.relatedTarget === null) {
			isDragOver = false;
		}
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

<svelte:window
	on:dragover|capture={handleWindowDragOver}
	on:drop|capture={handleWindowDrop}
	on:dragleave|capture={handleWindowDragLeave}
/>

<div
	bind:this={dropzoneRef}
	class="transition-color absolute inset-0 z-25 grid h-full place-content-center p-5 transition-colors"
	class:bg-background={isDragOver}
	class:pointer-events-none={viewerState.volumes.length > 0}
	role="region"
	aria-label="File upload area"
	aria-describedby="file-upload-instructions"
>
	{#if viewerState.volumes.length === 0 || isDragOver}
		<div transition:scale={{ duration: 100, easing: cubicInOut }} class={getClasses()}>
			<span class="mb-5"><FileUpIcon size={48} aria-hidden="true" /></span>
			<p id="file-upload-instructions" class="mb-1 text-center text-xl font-light">
				{#if viewerState.volumes.length === 0}
					<span class="font-semibold">Upload files</span> or drag and drop
				{:else}
					<span class="font-semibold">Drag and drop</span> more files
				{/if}
			</p>

			<span class="text-muted-foreground italic">{loader.acceptedExtensions}</span>

			<input
				class={`absolute inset-0 opacity-0 ${loader.isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
				type="file"
				accept={loader.acceptedExtensions}
				multiple={loader.multiple}
				aria-label="File input"
				onchange={(event) => loader.handleFiles(event)}
				disabled={loader.isLoading}
			/>
		</div>
	{/if}
</div>
