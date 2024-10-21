<svelte:options runes={true} />

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { FileUp } from 'lucide-svelte';

	type Props = {
		acceptedExtensions?: string;
		multiple?: boolean;
		acceptFolders?: boolean;
		isDisabled?: boolean;
	};

	const {
		acceptedExtensions = '',
		multiple = false,
		acceptFolders = false,
		isDisabled = false
	}: Props = $props();

	const dispatch = createEventDispatcher<{
		filesDropped: File[];
		unsupported: { entry: string; type: 'file' | 'folder' }[];
		error: string;
	}>();

	let isDragOver = false;

	function filterFilesByExtension(files: File[]): {
		files: File[];
		unsupported: { entry: string; type: 'file' }[];
	} {
		if (!acceptedExtensions) return { files, unsupported: [] };

		const allowedExtensions = acceptedExtensions.split(',').map((ext) => ext.trim().toLowerCase());

		const unsupportedFiles: { entry: string; type: 'file' }[] = [];
		const filteredFiles = files.filter((file) => {
			const isValid = allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
			if (!isValid) {
				unsupportedFiles.push({ entry: file.name, type: 'file' });
			}
			return isValid;
		});

		return { files: filteredFiles, unsupported: unsupportedFiles };
	}

	async function handleFiles(event: Event | DragEvent): Promise<void> {
		event.preventDefault();
		isDragOver = false;

		let files: File[] = [];
		let unsupported: { entry: string; type: 'file' | 'folder' }[] = [];

		if (event instanceof DragEvent) {
			const items = event.dataTransfer?.items;
			if (items) {
				const result = await getFilesFromItems(items, acceptFolders);
				files = result.files;
				unsupported.push(...result.unsupported);
			}
		} else if (event.target instanceof HTMLInputElement) {
			files = event.target.files ? Array.from(event.target.files) : [];
		}

		if (!files.length && !unsupported.length) return;

		if (!multiple && files.length > 1) {
			dispatch('error', 'Multiple files are not allowed');
			return;
		}

		const { files: filteredFiles, unsupported: unsupportedFiles } = filterFilesByExtension(files);
		unsupported.push(...unsupportedFiles);

		if (filteredFiles.length) {
			dispatch('filesDropped', filteredFiles);
		}

		if (unsupported.length) {
			dispatch('unsupported', unsupported);
		}
	}

	async function getFilesFromItems(
		items: DataTransferItemList,
		acceptFolders: boolean
	): Promise<{
		files: File[];
		unsupported: { entry: string; type: 'file' | 'folder' }[];
	}> {
		const files: File[] = [];
		const unsupported: { entry: string; type: 'file' | 'folder' }[] = [];
		const promises: Promise<void>[] = [];

		for (const item of items) {
			const entry = item.webkitGetAsEntry?.();
			if (entry) {
				if (entry.isFile) {
					promises.push(
						getFile(entry as FileSystemFileEntry)
							.then((file) => {
								files.push(file);
							})
							.catch(() => {
								unsupported.push({ entry: entry.name, type: 'file' });
							})
					);
				} else if (entry.isDirectory) {
					if (acceptFolders) {
						promises.push(
							readDirectory(entry as FileSystemDirectoryEntry)
								.then((dirFiles) => {
									files.push(...dirFiles);
								})
								.catch(() => {
									unsupported.push({ entry: entry.name, type: 'folder' });
								})
						);
					} else {
						unsupported.push({ entry: entry.name, type: 'folder' });
					}
				}
			} else {
				const file = item.getAsFile();
				if (file) files.push(file);
			}
		}

		await Promise.all(promises);

		return { files, unsupported };
	}

	function getFile(entry: FileSystemFileEntry): Promise<File> {
		return new Promise((resolve, reject) => {
			entry.file(resolve, reject);
		});
	}

	async function readDirectory(entry: FileSystemDirectoryEntry): Promise<File[]> {
		const files: File[] = [];
		const dirReader = entry.createReader();

		const readEntries = async (): Promise<void> => {
			const entries = await new Promise<FileSystemEntry[]>((resolve, reject) => {
				dirReader.readEntries(resolve, reject);
			});

			if (!entries.length) return;

			const entryPromises: Promise<void>[] = entries.map((e) => {
				if (e.isFile) {
					return getFile(e as FileSystemFileEntry)
						.then((file) => {
							files.push(file);
						})
						.catch(() => {
							dispatch('error', `Error reading file: ${e.name}`);
						});
				} else if (e.isDirectory) {
					return readDirectory(e as FileSystemDirectoryEntry)
						.then((dirFiles) => {
							files.push(...dirFiles);
						})
						.catch(() => {
							dispatch('error', `Error reading directory: ${e.name}`);
						});
				} else {
					return Promise.resolve();
				}
			});

			await Promise.all(entryPromises);
			await readEntries();
		};

		await readEntries();
		return files;
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
		const light =
			isDragOver && !isDisabled
				? 'border-neutral-400 bg-neutral-200'
				: 'border-neutral-200 bg-neutral-50';
		const hoverLight =
			!isDisabled && 'hover:border-neutral-400 hover:bg-neutral-200 focus:bg-neutral-200';
		const dark =
			isDragOver && !isDisabled
				? 'dark:border-neutral-500 dark:bg-neutral-800'
				: 'dark:border-neutral-700 dark:bg-neutral-900';
		const hoverDark = 'dark:hover:border-neutral-500 dark:hover:bg-neutral-800';
		const accessibility = 'focus-within:ring-4 ring-ring ring-offset-4 ring-offset-background';
		const disabled = isDisabled ? 'opacity-50' : '';

		return `${base} ${light} ${hoverLight} ${dark} ${hoverDark} ${accessibility} ${disabled}`;
	}
</script>

<div
	class={getClasses()}
	role="region"
	aria-label="File upload area"
	aria-describedby="file-upload-instructions"
>
	<span class="mb-5"><FileUp size={48} aria-hidden="true" /></span>
	<p id="file-upload-instructions" class="mb-1 text-center text-xl font-light">
		<span class="font-semibold">Upload files</span> or drag and drop
	</p>

	{#if acceptedExtensions}
		<span class="italic text-muted-foreground">{acceptedExtensions}</span>
	{/if}

	<input
		class={`absolute inset-0 opacity-0 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
		type="file"
		{multiple}
		accept={acceptedExtensions}
		aria-label="File input"
		onchange={handleFiles}
		ondrop={handleFiles}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		webkitdirectory={acceptFolders}
		disabled={isDisabled}
	/>
</div>
