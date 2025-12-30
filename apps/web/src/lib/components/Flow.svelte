<script lang="ts">
  import type { DndItem } from "@/types";
  import type { ActionDTO } from "@area/types";
  import { droppable, type DragDropState } from "@thisux/sveltednd";
  import { type Node, SvelteFlow, Controls, Background, BackgroundVariant, MiniMap, useSvelteFlow, type Edge } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";

  const { screenToFlowPosition } = useSvelteFlow();
	let nodes = $state.raw<Node[]>([]);
  let edges = $state.raw<Edge[]>([]);
  let mouseCoords = { clientX: 0, clientY: 0 };

  function handleDragOver(event: DragEvent) {
    mouseCoords = { clientX: event.clientX, clientY: event.clientY };
  }

  function handleDrop(state: DragDropState<DndItem>) {
    const { draggedItem } = state;

    const position = screenToFlowPosition({
      x: mouseCoords.clientX,
      y: mouseCoords.clientY
    });

		const newNode = {
      id: `${Math.random()}`,
      type: draggedItem.type,
      position,
      data: { label: `node` },
      origin: [0.5, 0.0]
    } satisfies Node;

    nodes = [...nodes, newNode];
  }
</script>

<div role="button" tabindex="0" class="w-full h-full" use:droppable={{ container: "list", callbacks: { onDrop: handleDrop } }} ondragover={handleDragOver}>
  <SvelteFlow bind:nodes bind:edges fitView>
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
