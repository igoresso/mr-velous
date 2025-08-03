<script lang="ts">
	import * as Resizable from '$lib/components/ui/resizable';
	import { Dropzone } from '$lib/components/custom/dropzone';
	import { Panel } from '$lib/components/custom/panel';
	import { getViewerState } from '$lib/context/viewer.svelte';

	const viewerState = getViewerState();

	let innerWidth = $state(0);
</script>

<svelte:window bind:innerWidth />

{#if viewerState.volumes.length !== 0 && innerWidth < 768}
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
{:else if viewerState.volumes.length !== 0 && innerWidth >= 768}
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
{/if}

<Dropzone />
