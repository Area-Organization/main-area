<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import Header from "@/components/Header.svelte";
  import { Toaster } from "@/components/ui/sonner";
  import { authClient } from "@/auth-client";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { onMount } from "svelte";

  let { children } = $props();
  let isChecking = $state(true);

  onMount(async () => {
    const publicRoutes = ["/login", "/register"];
    const path = page.url.pathname;
    const isPublic = publicRoutes.some((route) => path.startsWith(route));

    const { data: session } = await authClient.getSession();

    if (!session && !isPublic) {
      const fromUrl = page.url.pathname + page.url.search;
      goto(`/login?redirectTo=${encodeURIComponent(fromUrl)}`);
    } else if (session && isPublic) {
      const redirectTo = page.url.searchParams.get("redirectTo");
      goto(redirectTo ? decodeURIComponent(redirectTo) : "/");
    }

    isChecking = false;
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="dark bg-background min-h-screen text-foreground flex flex-col h-screen">
  <Header />
  <div class="flex-1 flex justify-center items-center w-full">
    {#if !isChecking}
      {@render children()}
    {/if}
  </div>
  <Toaster />
</div>
