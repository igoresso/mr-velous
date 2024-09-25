<svelte:options runes={true} />

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { FileUp } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	type Props = {
		acceptedExtensions?: string;
		multiple?: boolean;
	};

	const { acceptedExtensions = '', multiple = false }: Props = $props();

	let fileInput: HTMLInputElement;
	let isDragOver = $state(false);

	const dispatch = createEventDispatcher<{
		filesDropped: FileList;
		unsupportedFiles: string[];
	}>();

	function filterFilesByExtension(files: FileList): FileList {
		if (!acceptedExtensions) return files;

		const allowedExtensions = acceptedExtensions.split(',').map((ext) => ext.trim().toLowerCase());
		const unsupportedFiles: string[] = [];
		const filteredFiles = Array.from(files).filter((file) => {
			const lowerCaseName = file.name.toLowerCase();
			const isValid = allowedExtensions.some((ext) => lowerCaseName.endsWith(ext));
			if (!isValid) unsupportedFiles.push(file.name);
			return isValid;
		});

		if (unsupportedFiles.length > 0) {
			dispatch('unsupportedFiles', unsupportedFiles);
		}

		const dataTransfer = new DataTransfer();
		filteredFiles.forEach((file) => dataTransfer.items.add(file));
		return dataTransfer.files;
	}

	function handleFiles(event: Event | DragEvent): void {
		event.preventDefault();
		isDragOver = false;
		let files: FileList | null = null;

		if (event instanceof DragEvent) {
			files = event.dataTransfer?.files || null;
		} else if (event instanceof Event) {
			files = (event.target as HTMLInputElement).files || null;
		}

		if (!files) {
			return;
		}

		if (files.length !== 1 && !multiple) {
			toast.error('Multiple file uploads are not supported yet...');
			return;
		}

		const filteredFiles = filterFilesByExtension(files);
		if (filteredFiles.length > 0) {
			dispatch('filesDropped', filteredFiles);
		}
	}

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
		const light = `${isDragOver ? 'border-neutral-400 bg-neutral-200' : 'border-neutral-200 bg-neutral-50'} hover:border-neutral-400 hover:bg-neutral-200 focus:bg-neutral-200`;
		const dark = `${isDragOver ? 'dark:border-neutral-500 dark:bg-neutral-800' : 'dark:border-neutral-700 dark:bg-neutral-900'} dark:hover:border-neutral-500 dark:hover:bg-neutral-800`;
		const accessibility = 'focus-within:ring-4 ring-ring ring-offset-4 ring-offset-background';
		return `${base} ${light} ${dark} ${accessibility}`;
	}
</script>

<div
	class={getClasses()}
	role="region"
	aria-label="File upload area"
	aria-describedby="file-upload-instructions"
>
	<span class="mb-5"><FileUp size={48} aria-hidden="true" /></span>
	<span id="file-upload-instructions" class="mb-1 text-center text-xl font-light">
		<span class="font-semibold">Upload a file</span> or drag and drop
	</span>

	{#if acceptedExtensions}
		<span class="italic text-muted-foreground">{acceptedExtensions}</span>
	{/if}

	<input
		class="absolute inset-0 cursor-pointer opacity-0"
		type="file"
		{multiple}
		bind:this={fileInput}
		accept={acceptedExtensions}
		aria-label="File input"
		onchange={handleFiles}
		ondrop={handleFiles}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
	/>
</div>
