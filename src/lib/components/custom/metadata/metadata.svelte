<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { DICOM_TAGS_VISIBLE } from '$lib/config';
	import { getViewerState } from '$lib/context/viewer.svelte';
	import type { TagName } from '$lib/types';

	const viewerState = getViewerState();

	let activeVolume = $derived(viewerState.getActiveVolume());
	const tagEntries = Object.entries(DICOM_TAGS_VISIBLE) as [TagName, string][];
</script>

<section class="flex flex-col gap-2">
	<h2 class="text-lg font-semibold">Metadata</h2>

	<Table.Root class="overflow-hidden">
		<Table.Header>
			<Table.Row class="hover:bg-transparent">
				<Table.Head>Key</Table.Head>
				<Table.Head>Value</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each tagEntries as [name, code]}
				<Table.Row class="leading-none">
					<Table.Cell class="text-muted-foreground w-1/2">{name}</Table.Cell>
					<Table.Cell class="w-1/2 truncate">{activeVolume?.metadata.get(code) ?? '—'}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</section>
