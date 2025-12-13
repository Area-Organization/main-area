<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { getAreas } from "$lib/api/getAreas";
  import type { AreaType } from "@area/types";
  import { onMount } from "svelte";

  let areasPromise = $state<Promise<{ areas: AreaType[]; total: number; }>>();

  onMount(() => {
    areasPromise = getAreas({ limit: 50 });
  });

  async function toggleArea(areaId: string) {
    try {
      areasPromise = getAreas({ limit: 50 });
    } catch (error) {
      console.error("Failed to toggle area:", error);
    }
  }
</script>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-8">
    <div>
      <h1 class="text-4xl font-bold">Dashboard</h1>
      <p class="text-muted-foreground mt-2">Manage your automation areas</p>
    </div>
    <Button href="/create">
      Create New AREA
    </Button>
  </div>

  {#await areasPromise}
    <div class="flex items-center justify-center h-64">
      <p class="text-muted-foreground">Loading your areas...</p>
    </div>
  {:then data}
    {#if data && data.areas.length > 0}
      <div class="grid gap-4">
        {#each data.areas as area}
          <Card.Root>
            <Card.Header>
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <Card.Title>{area.name}</Card.Title>
                    <Badge variant={area.enabled ? "default" : "secondary"}>
                      {area.enabled ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {#if area.description}
                    <Card.Description class="mt-2">{area.description}</Card.Description>
                  {/if}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onclick={() => toggleArea(area.id)}
                >
                  {area.enabled ? "Disable" : "Enable"}
                </Button>
              </div>
            </Card.Header>
            <Card.Content>
              <div class="grid md:grid-cols-2 gap-4">
                <!-- Action Section -->
                <div class="border rounded-lg p-4 bg-orange-50/50">
                  <h3 class="font-semibold text-sm mb-2 flex items-center gap-2">
                    <span class="text-orange-600">⚡</span> Trigger
                  </h3>
                  {#if area.action}
                    <p class="text-sm">
                      <span class="font-medium capitalize">{area.action.serviceName}</span>
                      <span class="text-muted-foreground"> • {area.action.actionName}</span>
                    </p>
                  {/if}
                </div>

                <!-- Reaction Section -->
                <div class="border rounded-lg p-4 bg-purple-50/50">
                  <h3 class="font-semibold text-sm mb-2 flex items-center gap-2">
                    <span class="text-purple-600">🎯</span> Action
                  </h3>
                  {#if area.reaction}
                    <p class="text-sm">
                      <span class="font-medium capitalize">{area.reaction.serviceName}</span>
                      <span class="text-muted-foreground"> • {area.reaction.reactionName}</span>
                    </p>
                  {/if}
                </div>
              </div>

              <!-- Stats -->
              <div class="flex gap-4 mt-4 text-sm text-muted-foreground">
                <div>
                  <span class="font-medium">Triggers:</span> {area.triggerCount}
                </div>
                {#if area.lastTriggered}
                  <div>
                    <span class="font-medium">Last triggered:</span>
                    {new Date(area.lastTriggered).toLocaleString()}
                  </div>
                {/if}
              </div>
            </Card.Content>
          </Card.Root>
        {/each}
      </div>

      <div class="mt-6 text-center text-sm text-muted-foreground">
        Showing {data.areas.length} of {data.total} areas
      </div>
    {:else}
      <Card.Root>
        <Card.Content class="flex flex-col items-center justify-center py-12">
          <p class="text-muted-foreground mb-4">You haven't created any areas yet</p>
          <Button href="/create">Create Your First AREA</Button>
        </Card.Content>
      </Card.Root>
    {/if}
  {:catch error}
    <Card.Root>
      <Card.Content class="py-12">
        <p class="text-center text-destructive">Failed to load areas: {error.message}</p>
      </Card.Content>
    </Card.Root>
  {/await}
</div>
