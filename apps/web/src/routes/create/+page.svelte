<script lang="ts">
  import { onMount } from "svelte";
  import { SvelteFlowProvider, type Node, type Edge } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";
  import { toast } from "svelte-sonner";

  import ServiceSidebar from "@/components/area-editor/ServiceSidebar.svelte";
  import EditorCanvas from "@/components/area-editor/EditorCanvas.svelte";
  import CreateAreaDialog from "@/components/area-editor/CreateAreaDialog.svelte";

  import { client } from "@/api";
  import { getServices } from "@/api/getServices";
  import { getServiceConnections } from "@/api/getServiceConnections";
  import type { UserConnectionSchemaType, ServiceDTO } from "@area/types";
  import { goto } from "$app/navigation";

  type NodeData = {
    info: { name: string };
    paramValues?: Record<string, unknown>;
    valid?: boolean;
  };

  let nodes = $state.raw<Node[]>([]);
  let edges = $state.raw<Edge[]>([]);

  let servicesPromise = $state<Promise<ServiceDTO[]>>();
  let userConnections = $state<UserConnectionSchemaType[]>([]);

  onMount(async () => {
    servicesPromise = getServices();
    try {
      const result = await getServiceConnections();
      userConnections = result.connections;
    } catch (e) {
      console.error("Failed to fetch connections", e);
    }
  });

  let actionNb = $derived(nodes.filter((n) => n.type === "action").length);
  let reactionNb = $derived(nodes.filter((n) => n.type === "reaction").length);

  function validateArea() {
    if (actionNb === 0 || reactionNb === 0) return false;

    const allNodesValid = nodes.every((n) => n.data.valid !== false);
    if (!allNodesValid) return false;

    let link = 0;
    edges.forEach((e) => {
      if (e.source && e.target) link++;
    });
    if (!link) return false;

    return true;
  }

  function getConnectionId(serviceName: string): string | undefined {
    const connection = userConnections.find((c) => c.serviceName === serviceName);
    return connection?.id;
  }

  let isDialogOpen = $state(false);

  async function createArea(name: string, desc: string) {
    const actions = nodes.filter((n) => n.type == "action");
    const reactions = nodes.filter((n) => n.type == "reaction");

    const services = await servicesPromise;
    if (!services) return;

    const actionData = actions[0].data as unknown as NodeData;
    const reactionData = reactions[0].data as unknown as NodeData;

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

    const { error } = await client.api.areas.post({
      name: name,
      description: desc,
      action: {
        serviceName: actionServiceName,
        actionName: actionData.info.name,
        params: actionData.paramValues,
        connectionId: actionConnectionId
      },
      reaction: {
        serviceName: reactionServiceName,
        reactionName: reactionData.info.name,
        params: reactionData.paramValues,
        connectionId: reactionConnectionId
      }
    });

    if (error) {
      const errorMessage = (error.value as { message?: unknown })?.message
        ? String((error.value as { message: unknown }).message)
        : "Failed to create Area :(";

      toast.error(errorMessage);
    } else {
      toast.success("Area created!");
      isDialogOpen = false;
      goto("/")
    }
  }
</script>

<SvelteFlowProvider>
  <div class="h-full w-full flex justify-center items-center">
    <div class="grid grid-cols-[1fr_65%_1fr] h-full w-full gap-5 p-5">
      {#await servicesPromise}
        <div class="bg-card rounded-2xl p-3"><p>Loading...</p></div>
      {:then services}
        <ServiceSidebar title="Actions" type="action" services={services ?? []} {userConnections} />
      {:catch error}
        <div class="bg-card rounded-2xl p-3"><p class="text-destructive">Failed: {error.message}</p></div>
      {/await}

      <EditorCanvas bind:nodes bind:edges>
        <CreateAreaDialog bind:open={isDialogOpen} disabled={!validateArea()} onsubmit={createArea} />
      </EditorCanvas>

      {#await servicesPromise}
        <div class="bg-card rounded-2xl p-3"><p>Loading...</p></div>
      {:then services}
        <ServiceSidebar title="Reactions" type="reaction" services={services ?? []} {userConnections} />
      {:catch error}
        <div class="bg-card rounded-2xl p-3"><p class="text-destructive">Failed: {error.message}</p></div>
      {/await}
    </div>
  </div>
</SvelteFlowProvider>
