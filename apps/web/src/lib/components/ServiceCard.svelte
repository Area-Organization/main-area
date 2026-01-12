<script lang="ts">
  import type { OAuth2AuthUrlResponseType, ServiceDTO, UserConnectionSchemaType } from "@area/types";
  import ServiceIcon from "./ServiceIcon.svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Switch } from "./ui/switch";
  import { getServiceAuthUrl } from "@/api/getServiceAuthUrl";
  import { onMount } from "svelte";
  import { invalidate } from "$app/navigation";
  import Label from "./ui/label/label.svelte";
  import Input from "./ui/input/input.svelte";
  import PasswordInput from "./PasswordInput.svelte";
  import { client } from "@/api";
  import Button from "./ui/button/button.svelte";

  interface Props {
    service: ServiceDTO;
    connections: UserConnectionSchemaType[];
  }

  let { service, connections }: Props = $props();

  const connection = $derived(connections.find(c => c.serviceName === service.name));
  const isLinked = $derived(!!connection);

  let authPromise = $state<Promise<OAuth2AuthUrlResponseType>>();
  let values = $state<Record<string, string>>({});
  let isApiKeyDialogOpen = $state(false);
  let isConfirmDeletionOpen = $state(false);

  onMount(() => {
    if (service.authType == "oauth2") authPromise = getServiceAuthUrl(service.name, window.location.href);
  });

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
        await invalidate('app:connections');
        isConfirmDeletionOpen = false;
    } catch (error) {
        console.error("Failed to delete connection:", error);
    }
}
</script>

{#snippet cardContent()}
  <Card.Root class="w-xs h-full {isLinked ? 'bg-muted text-muted-foreground' : 'cursor-pointer group-hover:border-primary transition-colors'}">
    <Card.Header>
      <div class="flex w-full justify-between items-center">
        <div class="flex gap-5 items-center">
          <ServiceIcon name={service.name} />
          <Card.Title class="capitalize">{service.name}</Card.Title>
        </div>
        <Dialog.Root bind:open={isConfirmDeletionOpen}>
          <Dialog.Trigger>
            <Switch
              checked={isLinked}
              onclick={(e: MouseEvent) => {
                e.stopPropagation();
                e.preventDefault();
                if (isLinked) {
                  isConfirmDeletionOpen = true;
                }
              }}
            />
          </Dialog.Trigger>
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
      <Card.Description>{service.description}</Card.Description>
    </Card.Header>
  </Card.Root>
{/snippet}

{#if isLinked}
  {@render cardContent()}
{:else if service.authType == "oauth2"}
  {#await authPromise}
    {@render cardContent()}
  {:then auth}
    <a aria-label="{service.name} connection" href={auth?.authUrl} class="group transition-all">
      {@render cardContent()}
    </a>
  {/await}
{:else}
  <Dialog.Root bind:open={isApiKeyDialogOpen}>
    <Dialog.Trigger>
      <button
        class="group"
        onclick={() => {
          isApiKeyDialogOpen = true;
        }}
      >
        {@render cardContent()}
      </button>
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
              invalidate('app:connections');
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
