<script lang="ts">
  import * as Card from "@/components/ui/card";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import type { PageProps } from "./$types";
  import { ArrowRight, Edit2, Ellipsis, Frown, Smile, Trash, Power, Activity, Plus } from "lucide-svelte";
  import AreaAnimation from "@/components/AreaAnimation.svelte";
  import { client } from "@/api";
  import { invalidateAll } from "$app/navigation";
  import { toast } from "svelte-sonner";

  let { data }: PageProps = $props();

  const areas = $derived(data.areas);

  async function handleToggle(id: string) {
    const { error } = await client.api.areas({ id }).toggle.post();
    if (error) {
      toast.error("Failed to toggle status");
      return;
    }
    toast.success("Area status updated");
    invalidateAll();
  }

  async function handleDelete(id: string) {
    const { error } = await client.api.areas({ id }).delete();
    if (error) {
      toast.error("Failed to delete area");
      return;
    }
    toast.success("Area deleted");
    invalidateAll();
  }
</script>

<div class="flex flex-col justify-center items-center min-h-[85vh]">
  {#if areas.areas.length == 0}
    <a href="/areas/create">
      <Card.Root class="group transition-all hover:shadow-2xl hover:shadow-primary/20">
        <Card.Content class="relative grid grid-cols-2 min-h-65 gap-10">
          <div>
            <div class="transition-all ease-in-out group-hover:opacity-0 duration-500">
              <Frown class="absolute h-64 w-64 text-foreground/5" />
            </div>
            <div class="transition-all ease-in-out group-hover:opacity-100 opacity-0 duration-500">
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
    <div class="area-anim flex flex-col gap-4 w-full max-w-4xl">
      {#each areas.areas as area (area.id)}
        {@const glowIntensity = Math.min(area.triggerCount * 2, 60)}
        {@const glowColor = area.enabled ? "124, 58, 237" : "100, 116, 139"}

        <Card.Root
          class="p-5 flex flex-row items-center transition-all duration-500 border relative"
          style="
            box-shadow: 0 0 {glowIntensity}px -5px rgba({glowColor}, {Math.min(0.1 + area.triggerCount / 100, 0.5)});
            border-color: rgba({glowColor}, {Math.min(0.2 + area.triggerCount / 200, 0.6)});
          "
        >
          {#if area.enabled && area.triggerCount > 0}
            <div
              class="absolute inset-0 bg-purple-500/5 pointer-events-none transition-opacity duration-1000"
              style="opacity: {Math.min(area.triggerCount / 50, 0.2)}"
            ></div>
          {/if}

          <div class="flex-1 relative z-10">
            <Card.Header class="flex p-2">
              <div>
                <Card.Title class="text-xl flex items-center gap-2">
                  {area.name}
                  {#if area.triggerCount > 10}
                    <span
                      class="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/20 animate-pulse"
                    >
                      Hot
                    </span>
                  {/if}
                </Card.Title>
                <Card.Description class="text-lg line-clamp-1">{area.description}</Card.Description>
              </div>
            </Card.Header>
            <Card.Content>
              {#if area.action}
                <AreaAnimation action={area.action} reactions={area.reactions} />
              {/if}
            </Card.Content>
          </div>

          <div class="w-0.5 h-24 mx-4 bg-muted-foreground/20 rounded-full"></div>

          <div class="flex flex-col gap-1.5 min-w-50 text-sm text-muted-foreground relative z-10">
            <div class="flex justify-between items-center">
              <span>Status</span>
              <span
                class={`flex items-center gap-1 ${
                  area.enabled ? "text-primary font-medium" : "text-muted-foreground font-medium"
                }`}
              >
                {area.enabled ? "Active" : "Disabled"}
                <div
                  class={`w-1.5 h-1.5 rounded-full ${area.enabled ? "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.8)] animate-pulse" : "bg-muted-foreground"}`}
                ></div>
              </span>
            </div>

            <div class="flex justify-between items-center">
              <span>Trigger count</span>
              <span class="font-medium text-foreground tabular-nums flex items-center gap-1">
                {area.triggerCount}
                <Activity class="w-3 h-3 opacity-50" />
              </span>
            </div>

            {#if area.lastTriggered}
              <div class="flex justify-between items-center gap-4">
                <span>Last run</span>
                <span class="font-medium text-foreground">{new Date(area.lastTriggered).toLocaleDateString()}</span>
              </div>
            {/if}

            <div class="flex justify-between items-center gap-4">
              <span>Created</span>
              <span class="font-medium text-foreground">{new Date(area.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <div class="pl-6 relative z-10">
                <button class="p-2 hover:bg-muted rounded-md transition-colors">
                  <Ellipsis class="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content side="right" class="border border-muted-foreground w-48">
              <DropdownMenu.Group>
                <DropdownMenu.Label>Manage Area</DropdownMenu.Label>
                <DropdownMenu.Separator />

                <DropdownMenu.Item>
                  <a href={`/areas/modify/${area.id}`} class="flex items-center w-full">
                    <Edit2 class="w-4 h-4 mr-2" />
                    Modify
                  </a>
                </DropdownMenu.Item>

                <DropdownMenu.Item onclick={() => handleToggle(area.id)}>
                  <Power class="w-4 h-4 mr-2" />
                  {area.enabled ? "Disable" : "Enable"}
                </DropdownMenu.Item>

                <DropdownMenu.Separator />

                <DropdownMenu.Item
                  class="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                  onclick={() => handleDelete(area.id)}
                >
                  <Trash class="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenu.Item>
              </DropdownMenu.Group>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Card.Root>
      {/each}

      <a href="/areas/create" class="block w-full">
        <Card.Root
          class="p-8 border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group text-muted-foreground hover:text-foreground"
        >
          <div class="rounded-full bg-muted p-4 group-hover:bg-background transition-colors">
            <Plus class="w-6 h-6" />
          </div>
          <p class="font-medium">Create a new Area</p>
        </Card.Root>
      </a>
    </div>
  {/if}
</div>
