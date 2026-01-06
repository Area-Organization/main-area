<script lang="ts">
  import { setContext } from "svelte";
  import type { DndItem } from "@/types";
  import { toast } from "svelte-sonner";
  import { droppable, type DragDropState } from "@thisux/sveltednd";
  import {
    type Node,
    SvelteFlow,
    Controls,
    Background,
    BackgroundVariant,
    MiniMap,
    useSvelteFlow,
    type Edge
  } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";
  import ActionNode from "./ActionNode.svelte";
  import ReactionNode from "./ReactionNode.svelte";
  import Button from "./ui/button/button.svelte";
  import { client } from "@/api";

  const { screenToFlowPosition } = useSvelteFlow();
  let nodes = $state.raw<Node[]>([]);
  let edges = $state.raw<Edge[]>([]);

  setContext("flow-edges", {
    get value() {
      return edges;
    }
  });

  let mouseCoords = { clientX: 0, clientY: 0 };
  let isDeleting = false;

  let actionNb = $derived(nodes.filter((n) => n.type === "action").length);
  let reactionNb = $derived(nodes.filter((n) => n.type === "reaction").length);

  const nodeTypes = {
    action: ActionNode,
    reaction: ReactionNode
  };

  function handleDragOver(event: DragEvent) {
    mouseCoords = { clientX: event.clientX, clientY: event.clientY };
  }

  function handleNodesDelete({ nodes: deleted }: { nodes: Node[] }) {
    isDeleting = true;
    setTimeout(() => (isDeleting = false), 100);
    nodes = nodes.filter((n) => !deleted.some((d) => d.id === n.id));
  }

  function handleDrop(state: DragDropState<DndItem>) {
    const { draggedItem } = state;

    if (!draggedItem.info) return;

    if (isDeleting) return;

    if (draggedItem.type == "action" && actionNb > 0) {
      toast.error("There only can be one action per Area.");
      return;
    }

    const position = screenToFlowPosition({
      x: mouseCoords.clientX,
      y: mouseCoords.clientY
    });

    const newNode = {
      id: `${Math.random()}`,
      type: draggedItem.type,
      position,
      data: {
        label: `node`,
        info: draggedItem.info
      },
      origin: [0.5, 0.0]
    } satisfies Node;

    nodes = [...nodes, newNode];
  }
</script>

<div
  role="button"
  tabindex="0"
  class="w-full h-full"
  use:droppable={{ container: "list", callbacks: { onDrop: handleDrop } }}
  ondragover={handleDragOver}
>
  <SvelteFlow bind:nodes bind:edges {nodeTypes} fitView ondelete={handleNodesDelete}>
    <Controls />
    <Background gap={16} size={1} variant={BackgroundVariant.Dots} class="bg-card!" />
    <MiniMap />
  </SvelteFlow>
</div>

<style>
  :global(.svelte-flow__panel.bottom.right) {
    display: none !important;
  }

  :global(.svelte-flow__controls) {
    --xy-controls-button-background-color: var(--background);
    --xy-controls-button-background-color-hover: oklch(from var(--primary) calc(l * 0.9) c h);
    --xy-controls-button-color: var(--foreground);
    --xy-controls-button-color-hover: var(--foreground);
    --xy-controls-button-border-color: var(--border);
  }
</style>
