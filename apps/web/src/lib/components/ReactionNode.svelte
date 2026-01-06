<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import type { ReactionDTO } from "@area/types";
  import { draggable } from "@thisux/sveltednd";
  import { Handle, type NodeProps, Position, useSvelteFlow } from "@xyflow/svelte";
  import { X } from "lucide-svelte";
  import Input from "./ui/input/input.svelte";
  import Check from "@lucide/svelte/icons/check";

  interface Props extends NodeProps {
    data: {
      info: ReactionDTO;
      [key: string]: unknown;
    };
  }

  let { data, id, type, ...restProps }: Props = $props();

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

  const { deleteElements, updateNodeData } = useSvelteFlow();

  $effect(() => {
    const isValid = validateParams();

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
          class="nodrag text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
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
        >
          <Handle type="target" position={Position.Left} style="width: 12px; height: 12px;" />
        </div>
      </Card.Content>
    </Card.Root>
  </div>
{/if}
