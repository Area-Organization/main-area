<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import Header from "@/components/Header.svelte";
  import { authClient } from "@/auth-client";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  let { children } = $props();

  const session = authClient.useSession();
  const publicRoutes = ["/login", "/register"];

  $effect(() => {
    if ($session.isPending) return;

    const path = $page.url.pathname;
    const isPublic = publicRoutes.some((route) => path.startsWith(route));
    const isAuthenticated = !!$session.data;

    if (!isAuthenticated && !isPublic) {
      const fromUrl = encodeURIComponent($page.url.pathname + $page.url.search);
      goto(`/login?redirectTo=${fromUrl}`);
    }

    if (isAuthenticated && isPublic) {
      const redirectTo = $page.url.searchParams.get("redirectTo");
      goto(redirectTo ? decodeURIComponent(redirectTo) : "/");
    }
  });
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
