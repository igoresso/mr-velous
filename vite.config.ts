import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
	plugins: [
		sveltekit(),
		viteStaticCopy({
			targets: [
				{
					src: 'node_modules/@itk-wasm/image-io/dist/pipelines/nifti-read-image.{js,wasm,wasm.zst}',
					dest: 'pipelines'
				}
			]
		})
	],
	optimizeDeps: {
		exclude: ['itk-wasm', '@itk-wasm/image-io']
	},
	test: {
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
