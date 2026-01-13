<script lang="ts">
  import { getContext } from "svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import type { ActionDTO } from "@area/types";
  import { draggable } from "@thisux/sveltednd";
  import { Handle, Position, type NodeProps, useSvelteFlow, type Edge } from "@xyflow/svelte";
  import { Check, ChevronsLeftRight, Copy, X } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import Input from "./ui/input/input.svelte";

  interface Props extends NodeProps {
    data: {
      info: ActionDTO;
      [key: string]: unknown;
    };
  }

  let { data, id, type, ...restProps }: Props = $props();
  const { deleteElements, updateNodeData } = useSvelteFlow();

  let params = $derived(Object.entries(data?.info.params ?? {}));
  let paramValues = $state<Record<string, string>>({});
  $effect(() => {
    for (const [key] of params) {
      if (paramValues[key] === undefined) {
        paramValues[key] = "";
      }
    }
  });

  function validateParams() {
    for (const [key, value] of params) {
      if (paramValues[key] === "" && value.required) return false;
    }
    return true;
  }

  $effect(() => {
    const isValid = validateParams();

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
      <Card.Header class="flex flex-row justify-between items-center">
        <div class="flex gap-2 items-center">
          <Check
            size={20}
            class={`transition-colors ${validateParams() ? "text-green-500" : "text-muted-foreground/20"}`}
          />
          <Card.Title class="uppercase">{data.info.name}</Card.Title>
        </div>
        <button
          onmousedown={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          class="nodrag text-muted-foreground hover:text-red-500 cursor-pointer transition-colors"
          title="Delete node"
        >
          <X size={20} />
        </button>
      </Card.Header>
      <Card.Content>
        <div class="flex flex-col gap-5">
          {#each params as [key, param]}
            <div class="flex flex-col gap-2">
              <div class="flex justify-between items-center">
                {param.label}
                {#if param.required}
                  <p class="text-red-400">Required</p>
                {/if}
              </div>
              {#if param.type == "string"}
                <Input
                  id={key}
                  name={key}
                  type={param.type === "string" ? "text" : param.type}
                  placeholder={param.description}
                  required={param.required}
                  bind:value={paramValues[key]}
                />
              {/if}
            </div>
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

        <div
          role="button"
          tabindex="-1"
          class="nodrag"
          draggable={true}
          onmousedown={(e) => e.stopPropagation()}
          ontouchstart={(e) => e.stopPropagation()}
          onpointerdown={(e) => e.stopPropagation()}
          ondragstart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          style="position: absolute; right: 0; top: 50%; transform: translate(50%, -50%);"
        >
          <Handle
            type="source"
            position={Position.Right}
            style="width: 12px; height: 12px; position: static; transform: none;"
          />
        </div>
      </Card.Content>
    </Card.Root>
  </div>
{/if}
