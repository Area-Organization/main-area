import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
	plugins: [sveltekit(), tailwindcss()],
	optimizeDeps: {
		include: ['@xyflow/svelte']
	},
	ssr: {
		noExternal: ['@xyflow/svelte', '@thisux/sveltednd'],
	},
	server: {
		port: 8081
	},
	resolve: {
		conditions: mode === 'test' ? ['browser'] : undefined,
	},
    test: {
        include: ['tests/**/*.{test,spec}.{js,ts}'],
        environment: 'jsdom',
        globals: true,
        setupFiles: ['tests/setup.ts']
    }
}));
