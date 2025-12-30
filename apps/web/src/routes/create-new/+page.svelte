<script lang="ts">
  import Flow from "@/components/Flow.svelte";
  import { SvelteFlowProvider } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";
  import { onMount } from "svelte";
  import { getServices } from "@/api/getServices";
  import type { ServiceDTO } from "@area/types";
  import { draggable } from "@thisux/sveltednd";
  import { type DndItem } from "@/types";

  let servicesPromise = $state<Promise<ServiceDTO[]>>();

  onMount(() => {
    servicesPromise = getServices();
  });
</script>

<div class="h-full w-full flex justify-center items-center">
  <div class="grid grid-cols-[1fr_65%_1fr] h-full w-full gap-5 p-5">
    <div class="bg-card rounded-2xl p-3">
      <h3 class="text-2xl uppercase font-bold text-center">Actions</h3>
      <div class="flex flex-col items-center gap-2 mt-5">
        {#await servicesPromise}
          <p>Loading...</p>
        {:then services}
          {#each services as service}
            <div class="flex flex-col p-2 items-center w-full min-h-[5vh] border-border border rounded-2xl gap-2">
              <h4 class="capitalize font-bold">{service.name}</h4>
              {#each service.actions as action}
                <div
                  class="p-2 border border-border rounded-2xl cursor-move"
                  use:draggable={{ container: "list", dragData: { type: "Action", info: action } as DndItem }}
                >
                  <h5>{action.name}</h5>
                </div>
              {/each}
            </div>
          {/each}
        {:catch error}
          <p class="text-destructive">Failed: {error.message}</p>
        {/await}
      </div>
    </div>
    <div class="rounded-2xl overflow-hidden">
      <SvelteFlowProvider>
        <Flow />
      </SvelteFlowProvider>
    </div>
    <div class="bg-card rounded-2xl p-3">
      <h3 class="text-2xl uppercase font-bold text-center">Reactions</h3>
      <div class="flex flex-col items-center gap-2 mt-5">
        {#await servicesPromise}
          <p>Loading...</p>
        {:then services}
          {#each services as service}
            <div class="flex flex-col p-2 items-center w-full min-h-[5vh] border-border border rounded-2xl gap-2">
              <h4 class="capitalize font-bold">{service.name}</h4>
              {#each service.reactions as reaction}
                <div class="p-2 border border-border rounded-2xl">
                  <h5>{reaction.name}</h5>
                </div>
              {/each}
            </div>
          {/each}
        {:catch error}
          <p class="text-destructive">Failed: {error.message}</p>
        {/await}
      </div>
    </div>
  </div>
</div>
