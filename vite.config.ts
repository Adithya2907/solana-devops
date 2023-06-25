import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		Icons({
			compiler: 'svelte'
		})
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	resolve: {
		alias: {
			'node-fetch': 'isomorphic-fetch'
		}
	},
	define: {
		// This makes @project-serum/anchor 's process error not happen since it replaces all instances of process.env.BROWSER with true
		'process.env.BROWSER': true,
		'process.env.NODE_DEBUG': JSON.stringify(''),
	},
	server: {
		watch: {
			ignored: ['**/.artifacts/**']
		}
	}
});