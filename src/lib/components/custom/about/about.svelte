<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import Badge from '$lib/components/ui/badge/badge.svelte';
</script>

<Dialog.Header>
	<Dialog.Title class="flex items-center gap-1">
		<h2 class="text-3xl">MR.VELOUS</h2>
		<Badge class="ml-2" variant="destructive">non-clinical use</Badge>
	</Dialog.Title>
	<Dialog.Description class="text-left">
		This software is for investigational use only and not intended for diagnostic, therapeutic, or
		clinical decision-making purposes
	</Dialog.Description>
</Dialog.Header>
<p class="text-balance">
	MR Viewer with Enhanced Layout and Optimized User Experience, or simply
	<span
		class="bg-gradient-to-r from-sky-500 via-fuchsia-500 to-amber-500 bg-clip-text font-semibold text-transparent"
		>MR.VELOUS</span
	>, is a free and open-source medical image viewer distributed under the MIT license. It is
	designed for research, education, and non-clinical use. Built on the ITK-Wasm library, it
	leverages WebAssembly pipelines to efficiently load and visualize medical images directly in the
	browser.
</p>

<Dialog.Footer>
	<p class="text-pretty">
		The demo image is provided courtesy of the <a
			href="https://medicine.unimelb.edu.au/school-structure/medicine/research/mbciu"
			>Melbourne Brain Centre Imaging Unit (MBCIU)</a
		> .
	</p>
</Dialog.Footer>
