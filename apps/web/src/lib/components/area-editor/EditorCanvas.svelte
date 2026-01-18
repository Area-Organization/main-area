<script lang="ts">
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
  import ActionNode from "$lib/components/ActionNode.svelte";
  import ReactionNode from "$lib/components/ReactionNode.svelte";
  import { setContext } from "svelte";
  import type { DndItem, ReactionNodeData } from "$lib/types";
  import { toast } from "svelte-sonner";
  import type { Snippet } from "svelte";
  import Button from "../ui/button/button.svelte";
  import { getConnectionId, validateArea } from "@/area-utils";
  import { getAreaPreview } from "@/api/getPreview";
  import type { ServiceDTO, UserConnectionSchemaType } from "@area/types";

  let {
    children,
    nodes = $bindable(),
    edges = $bindable(),
    services,
    connections
  }: {
    children: Snippet;
    nodes: Node[];
    [key: string]: any;
    services: ServiceDTO[];
    connections: UserConnectionSchemaType[];
  } = $props();

  const { screenToFlowPosition } = useSvelteFlow();

  setContext("flow-edges", {
    get value() {
      return edges;
    }
  });

  const nodeTypes = {
    action: ActionNode,
    reaction: ReactionNode
  };

  let mouseCoords = { clientX: 0, clientY: 0 };
  let isDeleting = false;

  let actionNb = $derived(nodes.filter((n: Node) => n.type === "action").length);

  async function previewArea() {
    const reactionNodes = nodes.filter((n) => n.type == "reaction");

    const mappedReactions = [];
    for (const rNode of reactionNodes) {
      const rData = rNode.data as ReactionNodeData;
      const rServiceName = services.find((s) => s.reactions.find((r) => r.name === rData.info.name))?.name;

      if (!rServiceName) {
        toast.error(`Could not identify service for reaction: ${rData.info.name}`);
        return;
      }

      const rConnectionId = getConnectionId(rServiceName, connections);
      if (!rConnectionId) {
        toast.error(`No connection for ${rServiceName}.`);
        return;
      }

      mappedReactions.push({
        serviceName: rServiceName,
        reactionName: rData.info.name,
        params: rData.paramValues ?? {},
        connectionId: rConnectionId
      });
    }

    try {
      await getAreaPreview(mappedReactions);
      toast.success("Area previewed!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  }

  function handleDragOver(event: DragEvent) {
    mouseCoords = { clientX: event.clientX, clientY: event.clientY };
  }

  function handleNodesDelete({ nodes: deleted }: { nodes: Node[] }) {
    isDeleting = true;
    setTimeout(() => (isDeleting = false), 100);
    nodes = nodes.filter((n: Node) => !deleted.some((d) => d.id === n.id));
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
        label: draggedItem.type,
        info: draggedItem.info
      },
      origin: [0.5, 0.0]
    } satisfies Node;

    nodes = [...nodes, newNode];
  }
</script>

<div class="rounded-2xl overflow-hidden relative h-full w-full">
  <Button
    class="absolute top-2 left-1/2 -translate-x-1/2 z-10 text-card! scale-75 text-xl"
    disabled={!validateArea(nodes, edges)}
    onclick={previewArea}
  >
    Preview Area
  </Button>
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
  {@render children?.()}
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
