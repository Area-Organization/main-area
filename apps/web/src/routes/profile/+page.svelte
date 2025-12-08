<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import ServiceCard from "@/components/ServiceCard.svelte";
  import { authClient } from "@/auth-client";

  const session = authClient.useSession();
  const username = $derived($session.data?.user?.name ?? "User");

  const { servicesPromise, serviceConnectionPromise } = $props();
</script>

<div class="flex flex-col h-full w-full items-center gap-15 mt-15">
  <h1 class="text-3xl uppercase font-extrabold">Hello, {username}!</h1>
  <div class="flex items-center justify-center">
    <Card.Root class="w-3xs gap-2">
      <Card.Header>
        <Card.Title>Service linked</Card.Title>
      </Card.Header>
      <Card.Content>
        {#await serviceConnectionPromise}
          <p>Loading...</p>
        {:then serviceConnectionData}
          <p>{serviceConnectionData.total}</p>
        {:catch error}
          <p class="text-destructive">Failed: {error.message}</p>
        {/await}
      </Card.Content>
    </Card.Root>
  </div>
  <span class="bg-foreground h-0.5 w-[80%]"></span>
  {#await servicesPromise}
    <p>Loading services...</p>
  {:then services}
    <div class="grid grid-cols-3 gap-5">
      {#each services as service}
        <ServiceCard {service} />
      {/each}
    </div>
  {:catch error}
    <p class="text-destructive">Failed to load services: {error.message}</p>
  {/await}
</div>
