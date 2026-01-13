<script lang="ts">
  import { getContext } from "svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import type { ActionDTO } from "@area/types";
  import { draggable } from "@thisux/sveltednd";
  import { Handle, Position, type NodeProps, useSvelteFlow, type Edge } from "@xyflow/svelte";
  import { Check, ChevronsLeftRight, Copy, X } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import Input from "./ui/input/input.svelte";
  import ParamsInput from "./ParamsInput.svelte";
  import { validateNodeParams } from "@/area-utils";
  import NodeHeader from "./NodeHeader.svelte";
  import ResizedHandle from "./ResizedHandle.svelte";

  interface Props extends NodeProps {
    data: {
      info: ActionDTO;
      [key: string]: unknown;
      params?: { [x: string]: any };
    };
  }

  let { data, id, type, ...restProps }: Props = $props();
  const { deleteElements, updateNodeData } = useSvelteFlow();

  let params = $derived(Object.entries(data?.info.params ?? {}));
  let paramValues = $state<Record<string, string>>({});
  $effect(() => {
    for (const [key] of params) {
      if (paramValues[key] === undefined) {
        paramValues[key] = data.params?.[key] ? data.params?.[key] : "";
      }
    }
  });

  $effect(() => {
    const isValid = validateNodeParams(params, paramValues);

    const currentValues = JSON.stringify(data.paramValues || {});
    const newValues = JSON.stringify(paramValues);

    if (data.valid === isValid && currentValues === newValues) {
      return;
    }

    updateNodeData(id, { valid: isValid, paramValues });
  });

  const edgesCtx = getContext<{ value: Edge[] }>("flow-edges");

  let isConnected = $derived(edgesCtx.value.some((edge) => edge.source === id));

  function handleDelete() {
    deleteElements({ nodes: [{ id }] });
  }
</script>

{#if data.info}
  <div use:draggable={{ container: "node", dragData: { id, type } }}>
    <Card.Root class="gap-3 w-md">
      <NodeHeader {params} {paramValues} {handleDelete} name={data.info.name} />
      <Card.Content>
        <div class="flex flex-col gap-5">
          {#each params as [key, param]}
            <ParamsInput {param} {key} value={paramValues[key]} />
          {/each}
        </div>

        {#if isConnected}
          <div class="flex flex-col mt-3 gap-2">
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
