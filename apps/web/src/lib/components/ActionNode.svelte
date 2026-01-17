<script lang="ts">
  import { getContext } from "svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import { draggable } from "@thisux/sveltednd";
  import { Position, type NodeProps, useSvelteFlow, type Edge } from "@xyflow/svelte";
  import { ChevronsLeftRight, Copy } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import ParamsInput from "$lib/components/ParamsInput.svelte";
  import NodeHeader from "$lib/components/NodeHeader.svelte";
  import ResizedHandle from "$lib/components/ResizedHandle.svelte";
  import type { ActionNodeData } from "$lib/types";
  import { validateNode } from "@/area-utils";
  import { slide } from "svelte/transition";

  interface Props extends NodeProps {
    data: ActionNodeData;
  }

  let { data, id, type }: Props = $props();
  const { deleteElements, updateNodeData } = useSvelteFlow();
  const edgesCtx = getContext<{ value: Edge[] }>("flow-edges");

  let params = $derived(Object.entries(data?.info.params ?? {}));
  let paramValues = $state<Record<string, string>>({});

  let isConnected = $derived(
    edgesCtx.value.some((edge) => {
      return edge.source === id;
    })
  );

  $effect(() => {
    const incoming = data.paramValues ?? {};
    for (const [key] of params) {
      if (paramValues[key] === undefined) {
        paramValues[key] = incoming[key] ?? "";
      }
    }
  });

  $effect(() => {
    validateNode(params, paramValues, data, id, updateNodeData, edgesCtx);
  });

  function handleDelete() {
    deleteElements({ nodes: [{ id }] });
  }
</script>

{#if data.info}
  <div use:draggable={{ container: "node", dragData: { id, type } }}>
    <Card.Root class="gap-3 w-md">
      <NodeHeader isValid={data.valid ?? false} {handleDelete} name={data.info.name} />
      <Card.Content>
        <div class="flex flex-col gap-5">
          {#each params as [key, param]}
            <ParamsInput {param} {key} bind:value={paramValues[key]} />
          {/each}
        </div>

        {#if isConnected}
          <div transition:slide class="flex flex-col mt-3 gap-2">
            <h3 class="text-md font-bold">Variables</h3>
            {#each data.info.variables as variable, i}
              <div class="border border-muted-foreground/20 rounded-2xl p-3 flex justify-between items-center gap-2">
                <div class="flex gap-5 items-center">
                  <ChevronsLeftRight size={20} class="text-accent-foreground" />
                  <div class="flex flex-col">
                    <h4 class="">{variable.name}</h4>
                    <p class="text-muted-foreground text-wrap max-w-50">{variable.description}</p>
                  </div>
                </div>
                <button
                  class="nodrag text-foreground-muted hover:text-foreground cursor-pointer"
                  onmousedown={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText("{{".concat(variable.name).concat("}}"));
                    toast.info("Variable copied!");
                  }}
                >
                  <Copy class="text-muted-foreground hover:text-foreground" size={20} />
                </button>
              </div>
            {/each}
          </div>
        {/if}

        <ResizedHandle type="source" position={Position.Right} />
      </Card.Content>
    </Card.Root>
  </div>
{/if}
