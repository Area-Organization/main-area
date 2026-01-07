<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import Header from "@/components/Header.svelte";
  import { authClient } from "@/auth-client";
  let { children } = $props();

  const session = authClient.useSession();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="dark bg-background min-h-screen text-foreground flex flex-col h-screen">
  <Header />
  <div class="flex-1 flex justify-center items-center w-full">
    {#if $session.isPending}
      <div class="text-muted-foreground animate-pulse">Loading...</div>
    {:else}
      {@render children()}
    {/if}
  </div>
</div>
