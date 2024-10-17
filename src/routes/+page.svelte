<svelte:options runes={true} />

<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { getViewerState } from '$lib/viewer-state.svelte';
	import { base } from '$app/paths';
	import * as Resizable from '$lib/components/ui/resizable';
	import { Dropzone } from '$lib/components/custom/dropzone';
	import { Panel } from '$lib/components/custom/panel';
	import type { niftiReadImage as NiftiReadImageType } from '@itk-wasm/image-io';

	let niftiReadImage: typeof NiftiReadImageType;

	const viewerState = getViewerState();

	let innerWidth = $state(0);

	async function loadImageReaders() {
		const { setPipelinesBaseUrl, ...module } = await import('@itk-wasm/image-io');
		setPipelinesBaseUrl(`${base}/pipelines`);
		niftiReadImage = module.niftiReadImage;
	}

	$effect(() => {
		loadImageReaders();
	});

	async function handleFiles(event: CustomEvent<FileList>) {
		for (const file of event.detail) {
			try {
				const { image } = await niftiReadImage(file);
				viewerState.addVolume(file.name, image);
				toast.success(`File loaded successfully`, { description: file.name, class: 'break-all' });
			} catch (error) {
				if (error instanceof Error) {
					toast.error(`Error adding file`, { description: error.message });
				} else {
					toast.error(`Error adding file`, { description: 'An unknown error occurred.' });
				}
			}
		}
	}

	function handleUnsupportedFiles(event: CustomEvent<string[]>) {
		const files = event.detail;

		files.forEach((file) => {
			toast.error(`Unsupported filetype`, { description: `File: ${file}`, class: 'break-all' });
		});
	}
</script>

<svelte:window bind:innerWidth />

{#if viewerState.volumes.length === 0}
	<div class="grid h-full place-content-center p-5">
		<Dropzone
			acceptedExtensions=".nii, .nii.gz"
			multiple={false}
			on:filesDropped={handleFiles}
			on:unsupportedFiles={handleUnsupportedFiles}
		/>
	</div>
{:else}
	{#if innerWidth < 768}
		<Resizable.PaneGroup direction="vertical">
			<Resizable.Pane defaultSize={40} collapsible>
				<Panel view={viewerState.views[0]} />
			</Resizable.Pane>
			<Resizable.Handle withHandle />
			<Resizable.Pane defaultSize={30} collapsible>
				<Panel view={viewerState.views[1]} />
			</Resizable.Pane>
			<Resizable.Handle withHandle />
			<Resizable.Pane defaultSize={20} collapsible>
				<Panel view={viewerState.views[2]} />
			</Resizable.Pane>
		</Resizable.PaneGroup>
	{:else}
		<Resizable.PaneGroup direction="horizontal">
			<Resizable.Pane defaultSize={62} collapsible>
				<Panel view={viewerState.views[0]} />
			</Resizable.Pane>
			<Resizable.Handle withHandle />
			<Resizable.Pane defaultSize={38}>
				<Resizable.PaneGroup direction="vertical">
					<Resizable.Pane defaultSize={62} collapsible>
						<Panel view={viewerState.views[1]} />
					</Resizable.Pane>
					<Resizable.Handle withHandle />
					<Resizable.Pane defaultSize={38} collapsible>
						<Panel view={viewerState.views[2]} />
					</Resizable.Pane>
				</Resizable.PaneGroup>
			</Resizable.Pane>
		</Resizable.PaneGroup>
	{/if}`}
{/if}
