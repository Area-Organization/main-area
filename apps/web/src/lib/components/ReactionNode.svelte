<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { draggable } from "@thisux/sveltednd";
  import { type Edge, type NodeProps, Position, useSvelteFlow } from "@xyflow/svelte";
  import ParamsInput from "$lib/components/ParamsInput.svelte";
  import NodeHeader from "$lib/components/NodeHeader.svelte";
  import ResizedHandle from "$lib/components/ResizedHandle.svelte";
  import { validateNode } from "$lib/area-utils";
  import type { ReactionNodeData } from "$lib/types";
  import { getContext } from "svelte";

  interface Props extends NodeProps {
    data: ReactionNodeData
  }

  let { data, id, type, ...restProps }: Props = $props();
  const { deleteElements, updateNodeData } = useSvelteFlow();
  const edgesCtx = getContext<{ value: Edge[] }>("flow-edges");

  let params = $derived(Object.entries(data?.info.params ?? {}));
  let paramValues = $state<Record<string, string>>({});

  $effect(() => {
    const incoming = data.paramValues ?? {};
    for (const [key] of params) {
      if (paramValues[key] === undefined) {
        paramValues[key] = incoming[key] ?? "";
      }
    }
  });

  $effect(() => {
    validateNode(params, paramValues, data, id, updateNodeData, edgesCtx)
  });

  function handleDelete() {
    deleteElements({ nodes: [{ id }] });
  }
</script>

{#if data.info}
  <div use:draggable={{ container: "node", dragData: { id, type } }}>
    <Card.Root class={`gap-2 w-md transition-all`}>
      <NodeHeader isValid={data.valid ?? false} {handleDelete} name={data.info.name} />
      <Card.Content>
        <div class="flex flex-col gap-5">
          {#each params as [key, param]}
            <ParamsInput {param} {key} bind:value={paramValues[key]} />
          {/each}
        </div>
      <ResizedHandle type="target" position={Position.Left} />
      </Card.Content>
    </Card.Root>
  </div>
{/if}
