<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import type { ReactionDTO } from "@area/types";
  import { draggable } from "@thisux/sveltednd";
  import { Handle, type NodeProps, Position, useSvelteFlow } from "@xyflow/svelte";
  import { X } from "lucide-svelte";
  import Input from "./ui/input/input.svelte";
  import Check from "@lucide/svelte/icons/check";
  import ParamsInput from "./ParamsInput.svelte";
  import { validateNodeParams } from "@/area-utils";
  import NodeHeader from "./NodeHeader.svelte";
  import ResizedHandle from "./ResizedHandle.svelte";

  interface Props extends NodeProps {
    data: {
      info: ReactionDTO;
      [key: string]: unknown;
      params?: any;
    };
  }

  let { data, id, type, ...restProps }: Props = $props();

  let params = $derived(Object.entries(data?.info.params ?? {}));
  let paramValues = $state<Record<string, string>>({});
  $effect(() => {
    for (const [key] of params) {
      if (paramValues[key] === undefined) {
        paramValues[key] = data.params?.[key] ? data.params?.[key] : "";
      }
    }
  });

  const { deleteElements, updateNodeData } = useSvelteFlow();

  $effect(() => {
    const isValid = validateNodeParams(params, paramValues);

    const currentValues = JSON.stringify(data.paramValues || {});
    const newValues = JSON.stringify(paramValues);

    if (data.valid === isValid && currentValues === newValues) {
      return;
    }

    updateNodeData(id, { valid: isValid, paramValues });
  });

  function handleDelete() {
    deleteElements({ nodes: [{ id }] });
  }
</script>

{#if data.info}
  <div use:draggable={{ container: "node", dragData: { id, type } }}>
    <Card.Root class={`gap-2 w-md transition-all`}>
      <NodeHeader {params} {paramValues} {handleDelete} name={data.info.name} />
      <Card.Content>
        <div class="flex flex-col gap-5">
          {#each params as [key, param]}
            <ParamsInput {param} {key} value={paramValues[key]} />
          {/each}
        </div>
      <ResizedHandle type="target" position={Position.Left} />
      </Card.Content>
    </Card.Root>
  </div>
{/if}
