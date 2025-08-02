import tailwindcss from '@tailwindcss/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	optimizeDeps: {
		exclude: ['itk-wasm', '@itk-wasm/image-io', '@itk-wasm/dicom']
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					d3: ['d3-zoom', 'd3-selection', 'd3-scale'],
					components: ['bits-ui', '@lucide/svelte'],
					itk: ['@itk-wasm/image-io', '@itk-wasm/dicom', 'itk-wasm']
				}
			}
		}
	},
	test: {
		workspace: [
			{
				extends: './vite.config.ts',
				plugins: [svelteTesting()],
				test: {
					name: 'client',
					environment: 'jsdom',
					clearMocks: true,
					include: [
						'src/**/*.svelte.{test,spec}.{js,ts}',
						'src/lib/helpers/**/*.{test,spec}.{js,ts}'
					],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
