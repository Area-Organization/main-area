<script lang="ts">
  import { SvelteFlowProvider, type Node, type Edge } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";
  import { toast } from "svelte-sonner";

  import ServiceSidebar from "@/components/area-editor/ServiceSidebar.svelte";
  import EditorCanvas from "@/components/area-editor/EditorCanvas.svelte";
  import CreateAreaDialog from "@/components/area-editor/CreateAreaDialog.svelte";

  import { client } from "@/api";
  import { goto } from "$app/navigation";
  import type { PageProps } from "./$types";
  import { untrack } from "svelte";
  import { validateArea } from "@/area-utils";

  type NodeData = {
    info: { name: string };
    paramValues?: Record<string, unknown>;
  };

  let { data }: PageProps = $props();
  let curArea = $derived(data.curArea.area);
  let connections = $derived(data.connections.connections);
  let services = $derived(data.services);

  let nodes = $state.raw<Node[]>([]);
  let edges = $state.raw<Edge[]>([]);
  let actionInfo = $derived(() => {
    for (const service of services) {
      const action = service.actions.find((a) => a.name === curArea.action?.actionName);
      if (action) return action;
    }
    return undefined;
  });
  let reactionInfo = $derived(() => {
    for (const service of services) {
      const reaction = service.reactions.find((r) => r.name === curArea.reaction?.reactionName);
      if (reaction) return reaction;
    }
    return undefined;
  });

  $effect(() => {
    untrack(() => {
      nodes.push({
        id: `${Math.random()}`,
        type: "action",
        position: { x: 0, y: 0 },
        data: {
          label: `node`,
          info: actionInfo(),
          params: curArea.action?.params
        },
        origin: [0.5, 0.0]
      } satisfies Node);

      nodes.push({
        id: `${Math.random()}`,
        type: "reaction",
        position: { x: 0, y: 0 },
        data: {
          label: `node`,
          info: reactionInfo(),
          params: curArea.reaction?.params
        },
        origin: [0.5, 0.0]
      } satisfies Node);

      edges.push({
        id: `${Math.random()}`,
        source: nodes[0].id,
        target: nodes[1].id
      });
    });
  });

  function getConnectionId(serviceName: string): string | undefined {
    const connection = connections.find((c) => c.serviceName === serviceName);
    return connection?.id;
  }

  let isDialogOpen = $state(false);

  async function modifyArea(name: string, desc: string) {
    const actions = nodes.filter((n) => n.type == "action");
    const reactions = nodes.filter((n) => n.type == "reaction");
    const actionData = actions[0].data as NodeData;
    const reactionData = reactions[0].data as NodeData;

    const actionServiceName = services.find((s) => {
      return s.actions.find((a) => {
        return a.name == actionData.info.name;
      });
    })?.name;

    const reactionServiceName = services.find((s) => {
      return s.reactions.find((r) => {
        return r.name == reactionData.info.name;
      });
    })?.name;

    if (!actionServiceName || !reactionServiceName) {
      toast.error("Could not identify services.");
      return;
    }

    const actionConnectionId = getConnectionId(actionServiceName);
    const reactionConnectionId = getConnectionId(reactionServiceName);

    if (!actionConnectionId || !reactionConnectionId) {
      toast.error("No connections.");
      return;
    }

    const { error } = await client.api.areas({ id: curArea.id }).patch({
      name: name,
      description: desc,
      action: {
        serviceName: actionServiceName,
        actionName: actionData.info.name,
        params: actionData?.paramValues ?? [],
        connectionId: actionConnectionId
      },
      reaction: {
        serviceName: reactionServiceName,
        reactionName: reactionData.info.name,
        params: reactionData?.paramValues ?? [],
        connectionId: reactionConnectionId
      }
    });

    if (error) {
      const errorMessage = (error.value as { message?: unknown })?.message
        ? String((error.value as { message: unknown }).message)
        : "Failed to modify Area :(";

      toast.error(errorMessage);
    } else {
      toast.success("Area modified!");
      isDialogOpen = false;
      goto("/");
    }
  }
</script>

<SvelteFlowProvider>
  <div class="h-full w-full flex justify-center items-center">
    <div class="grid grid-cols-[1fr_65%_1fr] h-full w-full gap-5 p-5">
      <ServiceSidebar title="Actions" type="action" services={services ?? []} userConnections={connections} />

      <EditorCanvas bind:nodes bind:edges>
        <CreateAreaDialog
          bind:open={isDialogOpen}
          disabled={!validateArea(nodes, edges)}
          onsubmit={modifyArea}
          buttonText="Modify Area"
          dialogTitle="Modify your Area"
          validateButtonText="Modify"
          baseName={curArea.name}
          baseDesc={curArea.description}
        />
      </EditorCanvas>

      <ServiceSidebar title="Reactions" type="reaction" services={services ?? []} userConnections={connections} />
    </div>
  </div>
</SvelteFlowProvider>
