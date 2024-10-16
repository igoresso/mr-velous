<svelte:options runes={true} />

<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import Badge from '../ui/badge/badge.svelte';
</script>

<Dialog.Header>
	<Dialog.Title class="flex items-center space-x-3"
		><h2>MR.VELOUS</h2>
		<Badge class="ml-2" variant="destructive">non-clinical use</Badge>
	</Dialog.Title>
	<Dialog.Description class="text-left">
		This software is for investigational use only and not intended for diagnostic, therapeutic, or
		clinical decision-making purposes
	</Dialog.Description>
</Dialog.Header>
<p class="text-balance">
	MR Viewer with Enhanced Layout and Optimized User Experience, or simply <span
		class="bg-gradient-to-r from-sky-500 to-pink-500 bg-clip-text font-semibold text-transparent"
		>MR.VELOUS</span
	>, is a free and open-source medical image viewer distributed under the MIT license. It is
	designed for research, education, and non-clinical use. Built on the ITK-Wasm library, it
	leverages WebAssembly pipelines to efficiently load and visualize medical images directly in the
	browser.
</p>

<p class="text-pretty">
	The demo image is provided courtesy of the Melbourne Brain Centre Imaging Unit (<a
		href="https://medicine.unimelb.edu.au/school-structure/medicine/research/mbciu">MBCIU</a
	>).
</p>
