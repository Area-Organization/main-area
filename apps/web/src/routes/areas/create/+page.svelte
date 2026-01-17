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
  import { validateArea } from "@/area-utils";
  import type { ActionNodeData, ReactionNodeData } from "@/types";

  let { data }: PageProps = $props();
  let connections = $derived(data.connections.connections);
  let services = $derived(data.services);

  let nodes = $state.raw<Node[]>([]);
  let edges = $state.raw<Edge[]>([]);

  function getConnectionId(serviceName: string): string | undefined {
    const connection = connections.find((c) => c.serviceName === serviceName);
    return connection?.id;
  }

  let isDialogOpen = $state(false);

  async function createArea(name: string, desc: string) {
    const actionNode = nodes.find((n) => n.type == "action");
    const reactionNodes = nodes.filter((n) => n.type == "reaction");

    if (!actionNode || reactionNodes.length === 0) {
      toast.error("Incomplete Area configuration");
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
      toast.error(`No connection for ${actionServiceName}.`);
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
        connectionId: rConnectionId,
        posX: rNode.position.x,
        posY: rNode.position.y
      });
    }

    const { error } = await client.api.areas.post({
      name: name,
      description: desc,
      action: {
        serviceName: actionServiceName,
        actionName: actionData.info.name,
        params: actionData?.paramValues ?? {},
        connectionId: actionConnectionId,
        posX: actionNode.position.x,
        posY: actionNode.position.y
      },
      reactions: mappedReactions
    });

    if (error) {
      const errorMessage = (error.value as { message?: unknown })?.message
        ? String((error.value as { message: unknown }).message)
        : "Failed to create Area :(";

      toast.error(errorMessage);
    } else {
      toast.success("Area created!");
      isDialogOpen = false;
      goto("/");
    }
  }
</script>

<SvelteFlowProvider>
  <div class="h-full w-full grow justify-center items overflow-hidden">
    <div class="grid grid-cols-[1fr_65%_1fr] h-[92vh] gap-5 p-5">
      <ServiceSidebar title="Actions" type="action" services={services ?? []} userConnections={connections} />

      <EditorCanvas bind:nodes bind:edges>
        <CreateAreaDialog bind:open={isDialogOpen} disabled={!validateArea(nodes, edges)} onsubmit={createArea} />
      </EditorCanvas>

      <ServiceSidebar title="Reactions" type="reaction" services={services ?? []} userConnections={connections} />
    </div>
  </div>
</SvelteFlowProvider>
