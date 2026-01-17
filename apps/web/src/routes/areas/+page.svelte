<script lang="ts">
  import * as Card from "@/components/ui/card";
  import type { PageProps } from "./$types";
  import { ArrowRight, Frown, Smile } from "lucide-svelte";
  import gsap from "gsap";

  let { data }: PageProps = $props();

  const areas = $derived(data.areas);
</script>

{#if areas.areas.length == 0}
  <a href="/areas/create">
    <Card.Root class="group">
      <Card.Content class="relative grid grid-cols-2 min-h-65 gap-10">
        <div>
          <div class="transition-all ease-in-out group-hover:opacity-0">
            <Frown class="absolute h-64 w-64 text-foreground/5" />
          </div>
          <div class="transition-all ease-in-out group-hover:opacity-100 opacity-0">
            <Smile class="absolute h-64 w-64 text-foreground/5 group-hover:text-foreground/25 shadow-purple-400" />
          </div>
        </div>
        <div class="relative z-10 h-full py-8 w-full flex flex-col justify-between items-end">
          <div class="flex flex-col gap-4">
            <div class="space-y-1 flex items-end flex-col">
              <h3 class="text-2xl font-bold tracking-tight">No Area Created Yet..</h3>
              <p class="text-muted-foreground max-w-lg">Click here to create one!</p>
            </div>
          </div>
          <div class="flex items-center gap-2 text-blue-500 font-medium mt-6 group/link">
            <span>Create a New Area</span>
            <ArrowRight class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </Card.Content>
    </Card.Root>
  </a>
{:else}
  <div class="area-anim flex flex-col gap-2">
    {#each areas.areas as area}
      <Card.Root>
        <Card.Header>
          <Card.Title>{area.name}</Card.Title>
          <Card.Description>{area.description}</Card.Description>
        </Card.Header>
        <Card.Content>
          <div class="flex">

          </div>
        </Card.Content>
      </Card.Root>
    {/each}
  </div>
{/if}
