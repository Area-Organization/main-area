<script lang="ts">
  import type { OAuth2AuthUrlResponseType, ServiceDTO, UserConnectionSchemaType } from "@area/types";
  import ServiceIcon from "$lib/components/ServiceIcon.svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Switch } from "$lib/components/ui/switch";
  import { getServiceAuthUrl } from "$lib/api/getServiceAuthUrl";
  import { onMount } from "svelte";
  import { invalidate } from "$app/navigation";
  import Label from "$lib/components/ui/label/label.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import PasswordInput from "$lib/components/PasswordInput.svelte";
  import { client } from "$lib/api";
  import Button from "$lib/components/ui/button/button.svelte";
  import { cn } from "$lib/utils";
  import { toast } from "svelte-sonner";

  interface Props {
    service: ServiceDTO;
    connections: UserConnectionSchemaType[];
  }

  let { service, connections }: Props = $props();

  const connection = $derived(connections.find((c) => c.serviceName === service.name));
  const isLinked = $derived(!!connection);

  let authPromise = $state<Promise<OAuth2AuthUrlResponseType>>();
  let values = $state<Record<string, string>>({});
  let isApiKeyDialogOpen = $state(false);
  let isConfirmDeletionOpen = $state(false);

  onMount(() => {
    if (service.authType == "oauth2") authPromise = getServiceAuthUrl(service.name, window.location.href);
  });

  async function activateNoneService() {
    try {
      await client.api.connections.post({
        serviceName: service.name,
        metadata: { activated: true }
      });
      await invalidate("app:connections");
      toast.success(`${service.name} activated !`);
    } catch (error) {
      toast.error("Failed to activate service");
    }
  }

  function checkValidity() {
    if (
      Object.keys(values).length == service.authFields?.length &&
      Object.values(values).every((v) => {
        return v != "" && v != undefined;
      })
    ) {
      return true;
    }
    return false;
  }

  async function onSubmit() {
    return await client.api.connections.post({
      serviceName: service.name,
      accessToken: values["accessToken"],
      metadata: values
    });
  }

  async function deleteConnection() {
    if (!connection) return;

    try {
      await client.api.connections({ id: connection.id }).delete();
      await invalidate("app:connections");
      isConfirmDeletionOpen = false;
    } catch (error) {
      console.error("Failed to delete connection:", error);
    }
  }
</script>

<div class="h-full w-full">
  {#snippet cardContent()}
    <Card.Root
      class={cn(
        "h-full min-h-48 relative overflow-hidden transition-all duration-300 border",
        isLinked
          ? "bg-muted/50 border-muted-foreground/20"
          : "group hover:border-primary hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] bg-card"
      )}
    >
      {#if !isLinked}
        <div
          class="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        ></div>
      {/if}
      <Card.Header class="relative z-10 flex flex-col h-full justify-between gap-4 p-6">
        <div class="flex w-full justify-between items-start">
          <div class="flex items-center gap-3">
            <ServiceIcon name={service.name} />
            <div class="space-y-1">
              <Card.Title class="text-lg font-semibold capitalize leading-none tracking-tight"
                >{service.name}</Card.Title
              >
              <div class="flex items-center gap-2">
                <span
                  class={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1",
                    isLinked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}
                >
                  {isLinked ? "Connected" : "Available"}
                </span>
              </div>
            </div>
          </div>

          <Dialog.Root bind:open={isConfirmDeletionOpen}>
            <Switch
              checked={isLinked}
              onclick={(e: MouseEvent) => {
                e.stopPropagation();
                e.preventDefault();
                if (isLinked) {
                  isConfirmDeletionOpen = true;
                }
              }}
              class={cn("data-[state=checked]:bg-primary")}
            />
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Are you sure?</Dialog.Title>
                <Dialog.Description>
                  This action will delete the connection to this service and cannot be undone.
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Footer class="flex sm:justify-center sm:items-center">
                <Button variant="destructive" onclick={deleteConnection}>Confirm Deletion</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Root>
        </div>
        <Card.Description class="line-clamp-2 text-sm text-muted-foreground/80 mt-2">
          {service.description}
        </Card.Description>
      </Card.Header>
    </Card.Root>
  {/snippet}

  {#if isLinked}
    {@render cardContent()}
  {:else if service.authType == "none"}
    <button class="group text-left w-full" onclick={activateNoneService}>
      {@render cardContent()}
    </button>
  {:else if service.authType == "oauth2"}
    {#await authPromise}
      {@render cardContent()}
    {:then auth}
      <a aria-label="{service.name} connection" href={auth?.authUrl} class="group transition-all h-full block">
        {@render cardContent()}
      </a>
    {/await}
  {:else}
    <Dialog.Root bind:open={isApiKeyDialogOpen}>
      <Dialog.Trigger class="group h-full w-full text-left">
        {@render cardContent()}
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header class="mb-2">
          <Dialog.Title>Linking {service.name}</Dialog.Title>
        </Dialog.Header>

        {#each service.authFields as field, i}
          <div class="flex justify-between items-center">
            <Label class="text-md" for={i.toString()}>{field.label}</Label>
            {#if field.required}
              <p class="text-red-400">Required</p>
            {/if}
          </div>
          {#if field.type == "password"}
            <PasswordInput id={i.toString()} placeholder={field.description} bind:value={values[field.key]} />
          {:else}
            <Input id={i.toString()} placeholder={field.description} bind:value={values[field.key]} />
          {/if}
        {/each}

        <Dialog.Footer class="flex sm:justify-center sm:items-center">
          <Button
            variant="secondary"
            disabled={!checkValidity()}
            onclick={() => {
              onSubmit().then(() => {
                invalidate("app:connections");
                isApiKeyDialogOpen = false;
              });
            }}
          >
            Connect
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  {/if}
</div>
