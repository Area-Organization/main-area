<script lang="ts">
  import { draggable } from "@thisux/sveltednd";
  import type { DndItem } from "$lib/types";
  import type { ServiceDTO, UserConnectionSchemaType } from "@area/types";

  let { title, services, type, userConnections } = $props<{
    title: string;
    services: ServiceDTO[];
    type: "action" | "reaction";
    userConnections: UserConnectionSchemaType[];
  }>();

  function getConnectionId(serviceName: string): string | undefined {
    const connection = userConnections.find((c: UserConnectionSchemaType) => c.serviceName === serviceName);
    return connection?.id;
  }
</script>

<div class="bg-card rounded-2xl p-3">
  <h3 class="text-2xl uppercase font-bold text-center">{title}</h3>
  <div class="flex flex-col items-center gap-2 mt-5">
    {#each services as service}
      <div class="flex flex-col p-2 items-center w-full min-h-[5vh] border-border border rounded-2xl gap-2">
        <h4 class="capitalize font-bold">{service.name}</h4>
        {#if getConnectionId(service.name)}
          {@const items = type === 'action' ? service.actions : service.reactions}
          {#each items as item}
            <div
              class="p-2 border border-border rounded-2xl cursor-move"
              use:draggable={{ container: "list", dragData: { type: type, info: item } as DndItem }}
            >
              <h5>{item.name}</h5>
            </div>
          {/each}
        {:else}
          {#if type === 'action'}
             <p class="text-muted-foreground">Service is not linked :(</p>
          {:else}
             <a href="/profile" class="text-muted-foreground">Service is not linked :(</a>
          {/if}
        {/if}
      </div>
    {/each}
  </div>
</div>
