import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	optimizeDeps: {
		include: ['@xyflow/svelte']
	},
	ssr: {
		noExternal: ['@xyflow/svelte', '@thisux/sveltednd'],
	},
	server: {
		port: 8081
	}
});
