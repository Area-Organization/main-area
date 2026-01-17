<script lang="ts">
  import ServiceCard from "$lib/components/ServiceCard.svelte";
  import type { PageProps } from "./$types";
  import { auth } from "$lib/auth-client";
  import StatCard from "$lib/components/StatCard.svelte";
  import { Blocks, Link2 } from "lucide-svelte";

  const session = auth.useSession();
  const username = $derived($session.data?.user?.name ?? "User");

  let { data }: PageProps = $props();

  const services = $derived(data.services);
  const connections = $derived(data.connections?.connections ?? []);
  const totalLinked = $derived(data.connections?.total ?? 0);
</script>

<div class="container mx-auto p-6 space-y-8">
  <div class="flex flex-col gap-2">
    <h2 class="text-3xl font-bold tracking-tight">Profile</h2>
    <p class="text-muted-foreground">Manage your connected services and account settings.</p>
  </div>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <StatCard title="Total Services" stat={services.length} color="cyan" shadow="34,211,238,0.4">
      <Blocks class="h-4 w-4 text-muted-foreground" />
    </StatCard>

    <StatCard title="Connected Services" stat={totalLinked} color="green" shadow="5,223,114,0.4">
      <Link2 class="h-4 w-4 text-muted-foreground" />
    </StatCard>
  </div>

  <div class="space-y-4">
    <h3 class="text-xl font-semibold tracking-tight">Available Services</h3>
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each services as service}
        <ServiceCard {service} {connections} />
      {/each}
    </div>
  </div>
</div>
