<script lang="ts">
	import './layout.css';
	import { Toaster } from "$lib/components/ui/sonner/index.js";
	import favicon from '$lib/assets/favicon.svg';
	import Header from '@/components/Header.svelte';

  const session = authClient.useSession();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="bg-background min-h-screen text-foreground flex flex-col h-screen">
	<Header />
	<Toaster />
	<div class="flex-1 flex justify-center items-center w-full">
		{@render children()}
	</div>
</div>
