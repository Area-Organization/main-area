<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '@/components/Header.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="dark bg-background min-h-screen text-foreground flex flex-col">
	<Header />
	<div class="flex-1 flex justify-center items-center">
		{@render children()}
	</div>
</div>
