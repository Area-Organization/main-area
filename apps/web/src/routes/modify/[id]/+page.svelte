<script lang="ts">
  import { SvelteFlowProvider, type Node, type Edge } from "@xyflow/svelte";
  import type { ActionNodeData, ReactionNodeData } from "@/types";
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

  const getReactionInfo = (name: string) => {
    for (const service of services) {
      const reaction = service.reactions.find((r) => r.name === name);
      if (reaction) return reaction;
    }
    return undefined;
  };

  $effect(() => {
    untrack(() => {
      // Bonobones t'es gay
      const actionNodeId = `${Math.random()}`;
      nodes.push({
        id: actionNodeId,
        type: "action",
        position: { x: 100, y: 200 },
        data: {
          label: "action",
          info: actionInfo(),
          paramValues: curArea.action?.params
        },
        origin: [0.5, 0.0]
      } satisfies Node);

      curArea.reactions.forEach((reaction, index) => {
        const reactionNodeId = `${Math.random()}`;
        nodes.push({
          id: reactionNodeId,
          type: "reaction",
          position: { x: 600, y: 100 + index * 200 },
          data: {
            label: "reaction",
            info: getReactionInfo(reaction.reactionName),
            paramValues: reaction.params
          },
          origin: [0.5, 0.0]
        } satisfies Node);

        edges.push({
          id: `${Math.random()}`,
          source: actionNodeId,
          target: reactionNodeId
        });
      });
    });
  });

  function getConnectionId(serviceName: string): string | undefined {
    const connection = connections.find((c) => c.serviceName === serviceName);
    return connection?.id;
  }

  let isDialogOpen = $state(false);

  async function modifyArea(name: string, desc: string) {
    const actionNode = nodes.find((n) => n.type === "action");
    const reactionNodes = nodes.filter((n) => n.type === "reaction");

    if (!actionNode || reactionNodes.length === 0) {
      toast.error("Missing nodes");
      return;
    }

    const actionData = actionNode.data as ActionNodeData;
    const actionServiceName = services.find((s) => s.actions.find((a) => a.name === actionData.info.name))?.name;

    if (!actionServiceName) {
      toast.error("Could not identify action service.");
      return;
    }
    const actionConnectionId = getConnectionId(actionServiceName);
    if (!actionConnectionId) {
      toast.error("Action connection missing.");
      return;
    }

    const mappedReactions = [];
    for (const rNode of reactionNodes) {
      const rData = rNode.data as ReactionNodeData;
      const rServiceName = services.find((s) => s.reactions.find((r) => r.name === rData.info.name))?.name;

      if (!rServiceName) {
        toast.error(`Could not identify service for reaction: ${rData.info.name}`);
        return;
      }

      const rConnectionId = getConnectionId(rServiceName);
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

    const { error } = await client.api.areas({ id: curArea.id }).patch({
      name: name,
      description: desc,
      action: {
        serviceName: actionServiceName,
        actionName: actionData.info.name,
        params: actionData?.paramValues ?? {},
        connectionId: actionConnectionId
      },
      reactions: mappedReactions
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
