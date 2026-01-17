<script lang="ts">
  import { draggable } from "@thisux/sveltednd";
  import type { DndItem } from "$lib/types";
  import type { ServiceDTO, UserConnectionSchemaType } from "@area/types";
  import ServiceIcon from "$lib/components/ServiceIcon.svelte";
  import Badge from "$lib/components/ui/badge/badge.svelte";
  import { cn } from "$lib/utils";
  import { GripVertical, AlertCircle, ChevronRight } from "lucide-svelte";
  import { slide } from "svelte/transition";

  let { title, services, type, userConnections } = $props<{
    title: string;
    services: ServiceDTO[];
    type: "action" | "reaction";
    userConnections: UserConnectionSchemaType[];
  }>();

  let openServices = $state<Record<string, boolean>>({});

  function isConnected(serviceName: string): boolean {
    return !!userConnections.find((c: UserConnectionSchemaType) => c.serviceName === serviceName);
  }

  function toggle(serviceName: string) {
      openServices[serviceName] = !openServices[serviceName];
  }
</script>

<div class="h-full flex flex-col gap-2 bg-card/50 rounded-xl border border-border/50 p-2 overflow-hidden">
  <div class="flex items-center justify-between px-2 pt-1 pb-2 border-b border-border/50 shrink-0">
    <h3 class="text-sm font-semibold tracking-tight">{title}</h3>
  </div>

  <div class="flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1 pr-1">
    {#each services as service}
      {@const connected = isConnected(service.name)}
      {@const items = type === "action" ? service.actions : service.reactions}
      {@const isOpen = openServices[service.name] || false}

      <div class={cn("rounded-lg border transition-all duration-200 shrink-0", isOpen ? "bg-background border-border shadow-sm" : "bg-transparent border-transparent hover:bg-muted/50")}>
        <button
            onclick={() => connected && toggle(service.name)}
            class={cn("w-full flex items-center gap-2 p-1.5 text-left bg-transparent rounded-lg transition-colors", !connected && "opacity-50 cursor-not-allowed")}
            disabled={!connected}
        >
            <div class={cn("shrink-0 transition-transform duration-200 text-muted-foreground", isOpen && "rotate-90", !connected && "invisible")}>
                <ChevronRight class="h-3.5 w-3.5" />
            </div>

            <ServiceIcon name={service.name} class="min-w-6 min-h-6 w-6 h-6 p-1 bg-muted" />

            <span class="text-xs font-semibold capitalize flex-1 truncate">{service.name}</span>

            {#if !connected}
                <div class="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
                    <span class="whitespace-nowrap">Not linked</span>
                </div>
            {/if}
        </button>

        {#if isOpen && connected}
            <div class="px-2 pb-2 pl-7 space-y-1" transition:slide={{ duration: 200, axis: 'y' }}>
                <div class="h-px bg-border/40 mb-2 ml-1"></div>
                {#if items && items.length > 0}
                    {#each items as item}
                         <div
                            class="group flex items-start gap-2 rounded border-muted-foreground bg-muted/30 p-1.5 text-[10px] hover:bg-accent hover:text-accent-foreground hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing select-none"
                            use:draggable={{
                                container: "list",
                                dragData: { type: type, info: item } as DndItem,
                            }}
                         >
                             <GripVertical class="h-3 w-3 mt-0.5 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0" />
                             <span class="font-medium leading-normal">{item.name}</span>
                         </div>
                    {/each}
                {:else}
                    <div class="text-[10px] text-muted-foreground italic py-1 pl-1">No {type}s found</div>
                {/if}
            </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
