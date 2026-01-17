<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Carousel from "$lib/components/ui/carousel/index.js";
  import { LayoutGrid, Activity, CirclePause, Zap, Settings, ArrowRight, Frown, Clock } from "lucide-svelte";
  import type { PageProps } from "./$types";
  import StatCard from "@/components/StatCard.svelte";
  import Autoplay from "embla-carousel-autoplay";

  let { data }: PageProps = $props();

  let stats = $derived(data.stats);
</script>

{#snippet triggerCard()}
  <Card.Root
    class="relative w-full col-span-1 lg:col-span-2 transition-all duration-300 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(192,132,252,0.4)] border border-transparent min-h-75 flex overflow-hidden group"
  >
    <div
      class="absolute inset-0 bg-linear-to-bl from-purple-400/7 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
    ></div>
    {#if stats.recentlyTriggered.length > 0}
      <Card.Header>
        <Card.Title>Last Triggers</Card.Title>
      </Card.Header>
    {/if}
    <Card.Content class="flex justify-center h-full w-full">
      {#if stats.recentlyTriggered.length === 0}
        <div class="relative z-10 h-full py-8 w-full flex flex-col justify-between items-end">
          <div class="flex flex-col gap-4">
            <div class="space-y-1 flex items-end flex-col">
              <h3 class="text-2xl font-bold tracking-tight">No Area Triggered Yet</h3>
              <p class="text-muted-foreground max-w-lg">Click here to create one!</p>
            </div>
          </div>
          <div class="flex items-center gap-2 text-blue-500 font-medium mt-6 group/link">
            <span>Create a New Area</span>
            <ArrowRight class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
          <Frown
            class="absolute top-15 right-85 rotate-15 h-64 w-64 text-foreground/5 transition-transform duration-700 ease-out group-hover:-rotate-12 group-hover:scale-110 pointer-events-none"
          />
        </div>
      {:else}
        <Carousel.Root
          opts={{
            loop: true
          }}
          plugins={[
            Autoplay({
              delay: 5000
            })
          ]}
        >
          <Carousel.Content class="w-110">
            {#each stats.recentlyTriggered as area}
              <Carousel.Item>
                <div class="group/c relative h-50 w-full overflow-hidden rounded-xl border border-border bg-card p-1 shadow-sm transition-all hover:bg-accent/5">
                  <div class="flex h-full flex-col justify-between rounded-lg bg-background/50 p-5">
                    <div class="flex items-start justify-between">
                      <div class="rounded-full bg-purple-500/10 p-2 text-purple-500">
                        <Zap class="h-5 w-5" />
                      </div>
                      <span class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        Triggered
                      </span>
                    </div>

                    <div class="space-y-1">
                      <h4 class="font-semibold leading-tight tracking-tight line-clamp-2">
                        {area.name}
                      </h4>
                    </div>

                    <div class="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock class="h-3.5 w-3.5" />
                      <span>
                        {new Date(area.triggeredAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </Carousel.Item>
            {/each}
          </Carousel.Content>
          <Carousel.Previous />
          <Carousel.Next />
        </Carousel.Root>
      {/if}
    </Card.Content>
  </Card.Root>
{/snippet}

<div class="container mx-auto p-6 space-y-8 flex flex-col min-h-[85vh] justify-center">
  <div class="flex items-center justify-between">
    <h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
  </div>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <StatCard title="Total Areas" stat={stats.totalAreas} color="cyan" shadow="34,211,238,0.4">
      <LayoutGrid class="h-4 w-4 text-muted-foreground" />
    </StatCard>

    <StatCard title="Active Areas" stat={stats.activeAreas} color="teal" shadow="0,213,190,0.4">
      <Activity class="h-4 w-4 text-muted-foreground" />
    </StatCard>

    <StatCard title="Inactive Areas" stat={stats.inactiveAreas} color="emerald" shadow="0,212,146,0.4">
      <CirclePause class="h-4 w-4 text-muted-foreground" />
    </StatCard>

    <StatCard title="Total Triggers" stat={stats.totalTriggers} color="green" shadow="5,223,114,0.4">
      <Zap class="h-4 w-4 text-muted-foreground" />
    </StatCard>
  </div>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
    {#if stats.recentlyTriggered.length === 0}
      <a href="/areas/create" class="col-span-1 lg:col-span-2 flex h-full w-full">
        {@render triggerCard()}
      </a>
    {:else}
      {@render triggerCard()}
    {/if}

    <a href="/areas" class="col-span-1 lg:col-span-3 group block h-full">
      <Card.Root
        class="h-full relative overflow-hidden transition-all duration-300 border border-transparent group-hover:border-indigo-400 group-hover:shadow-[0_0_30px_rgba(124,134,255,0.25)]"
      >
        <div
          class="absolute inset-0 bg-linear-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        ></div>
        <Card.Content class="relative z-10 h-full p-8 flex flex-col justify-between">
          <div class="flex flex-col gap-4">
            <div class="space-y-1">
              <h3 class="text-2xl font-bold tracking-tight">Manage Areas</h3>
              <p class="text-muted-foreground max-w-lg">View, configure, and monitor your automation workflows!</p>
            </div>
          </div>
          <div class="flex items-center gap-2 text-indigo-500 font-medium mt-6 group/link">
            <span>Open Area Manager</span>
            <ArrowRight class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
          <Settings
            class="absolute -right-12 -bottom-12 h-64 w-64 text-foreground/5 transition-transform duration-700 ease-out group-hover:rotate-12 group-hover:scale-110 pointer-events-none"
          />
        </Card.Content>
      </Card.Root>
    </a>
  </div>
</div>
