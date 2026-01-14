<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import ServiceCard from "$lib/components/ServiceCard.svelte";
  import type { PageProps } from "./$types";
  import { auth } from "$lib/auth-client";

  const session = auth.useSession();
  const username = $derived($session.data?.user?.name ?? "User");

  let { data }: PageProps = $props();

  const services = $derived(data.services);
  const connections = $derived(data.connections?.connections ?? []);
  const totalLinked = $derived(data.connections?.total ?? 0);
</script>

<div class="flex flex-col h-full w-full items-center gap-15 mt-15">
  <h1 class="text-3xl uppercase font-extrabold">Hello, {username}!</h1>
  <div class="flex items-center justify-center">
    <Card.Root class="w-3xs gap-2">
      <Card.Header>
        <Card.Title>Service linked</Card.Title>
      </Card.Header>
      <Card.Content>
        <p>{totalLinked}</p>
      </Card.Content>
    </Card.Root>
  </div>
  <span class="bg-foreground h-0.5 w-[80%]"></span>
  <div class="grid grid-cols-3 gap-5">
    {#each services as service}
      <ServiceCard {service} {connections} />
    {/each}
  </div>
</div>
