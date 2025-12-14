<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Form from "$lib/components/ui/form/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "@/components/ui/input";
  import { getServices } from "@/api/getServices";
  import { getServiceConnections } from "@/api/getServiceConnections";
  import type { ActionDTO, ReactionDTO, ServiceDTO, UserConnectionSchemaType } from "@area/types";
  import { onMount } from "svelte";
  import { superForm } from "sveltekit-superforms";
  import { typebox } from "sveltekit-superforms/adapters";
  import { createAreaSchema } from "@/schemas/area.schemas";
  import { client } from "@/api";
  import { goto, invalidateAll } from "$app/navigation";

  let servicesPromise = $state<Promise<ServiceDTO[]>>();
  let userConnections = $state<UserConnectionSchemaType[]>([]);

  let step = $state(1);
  let selectedActionService = $state<ServiceDTO | null>(null);
  let selectedAction = $state<ActionDTO | null>(null);
  let selectedReactionService = $state<ServiceDTO | null>(null);
  let selectedReaction = $state<ReactionDTO | null>(null);

  let actionParamValues = $state<Record<string, any>>({});
  let reactionParamValues = $state<Record<string, any>>({});

  function getConnectionId(serviceName: string): string | undefined {
    const connection = userConnections.find((c) => c.serviceName === serviceName);
    return connection?.id;
  }

  const form = superForm(
    {
      name: "",
      description: "",
      action: {
        serviceName: "",
        actionName: "",
        params: {}
      },
      reaction: {
        serviceName: "",
        reactionName: "",
        params: {}
      }
    },
    {
      SPA: true,
      dataType: "json",
      validators: typebox(createAreaSchema),
      async onUpdate({ form }) {
        if (!form.valid) return;

        const actionConnectionId = getConnectionId(form.data.action.serviceName);
        const reactionConnectionId = getConnectionId(form.data.reaction.serviceName);

        if (!actionConnectionId) {
          alert(`You are not connected to ${form.data.action.serviceName}. Please go to profile and connect.`);
          return;
        }

        if (!reactionConnectionId) {
          alert(`You are not connected to ${form.data.reaction.serviceName}. Please go to profile and connect.`);
          return;
        }

        try {
          const { data, error } = await client.api.areas.post({
            name: form.data.name,
            description: form.data.description,
            action: {
              serviceName: form.data.action.serviceName,
              actionName: form.data.action.actionName,
              params: form.data.action.params,
              connectionId: actionConnectionId
            },
            reaction: {
              serviceName: form.data.reaction.serviceName,
              reactionName: form.data.reaction.reactionName,
              params: form.data.reaction.params,
              connectionId: reactionConnectionId
            }
          });

          if (error) {
            console.error("Failed to create AREA:", error.status, error.value);
            alert(`Error: ${error.value.message || "Failed to create AREA"}`);
            return;
          }

          console.log("AREA created successfully:", data);

          await invalidateAll();
          await goto("/");
        } catch (error) {
          console.error("Error creating AREA:", error);
        }
      }
    }
  );

  const { form: formData, enhance } = form;

  onMount(async () => {
    servicesPromise = getServices();
    try {
      const result = await getServiceConnections();
      userConnections = result.connections;
    } catch (e) {
      console.error("Failed to fetch connections", e);
    }
  });

  function validateParams(params: Record<string, any>, paramValues: Record<string, any>): boolean {
    const entries = Object.entries(params);
    if (entries.length === 0) return true;

    return entries.every(([key, param]) => {
      if (!param.required) return true;
      const value = paramValues[key];
      return value !== undefined && value !== null && value !== "";
    });
  }

  function confirmAction() {
    if (!selectedActionService || !selectedAction) return;

    if (!validateParams(selectedAction.params ?? {}, actionParamValues)) {
      alert("Please fill in all required parameters");
      return;
    }

    $formData.action = {
      serviceName: selectedActionService.name,
      actionName: selectedAction.name,
      params: actionParamValues
    };

    step = 3;
  }

  function confirmReaction() {
    if (!selectedReactionService || !selectedReaction) return;

    if (!validateParams(selectedReaction.params ?? {}, reactionParamValues)) {
      alert("Please fill in all required parameters");
      return;
    }

    $formData.reaction = {
      serviceName: selectedReactionService.name,
      reactionName: selectedReaction.name,
      params: reactionParamValues
    };

    step = 5;
  }
</script>

<div class="flex flex-col">
  <div class="flex p-2">
    <span class={step >= 1 ? "font-bold text-primary" : ""}>1. Action Service</span> &rarr;
    <span class={step >= 2 ? "font-bold text-primary" : "mx-2"}>2. Trigger</span> &rarr;
    <span class={step >= 3 ? "font-bold text-primary" : "mx-2"}>3. Reaction Service</span> &rarr;
    <span class={step >= 4 ? "font-bold text-primary" : "mx-2"}>4. Reaction</span> &rarr;
    <span class={step >= 5 ? "font-bold text-primary" : "mx-2"}>5. Finalize</span>
  </div>

  {#await servicesPromise}
    <p>Loading services...</p>
  {:then services}
    <Card.Root>
      <Card.Content class="gap-5 flex flex-col">
        {#if step === 1}
          <Card.Header>
            <Card.Title>Choose a trigger service (Action)</Card.Title>
          </Card.Header>
          <div class="grid grid-cols-3 gap-4">
            {#each services as service}
              {#if service.actions.length > 0}
                <Button
                  variant="ghost"
                  class="w-full h-full p-4 capitalize border"
                  onclick={() => {
                    selectedActionService = service;
                    step = 2;
                  }}
                >
                  {service.name}
                </Button>
              {/if}
            {/each}
          </div>
        {:else if step === 2 && selectedActionService}
          <Card.Header class="px-0">
            <Card.Title>Choose the event for {selectedActionService.name}</Card.Title>
          </Card.Header>
          <div class="flex flex-col gap-2">
            {#each selectedActionService.actions as action}
              <Dialog.Root>
                <Dialog.Trigger>
                  <Button variant="ghost" class="w-full h-full justify-start text-left border">
                    <div class="flex flex-col items-start gap-1">
                      <div class="font-bold">{action.name}</div>
                      <div class="text-sm text-gray-500 font-normal">{action.description}</div>
                    </div>
                  </Button>
                </Dialog.Trigger>
                <Dialog.Content>
                  <Dialog.Header>
                    <Dialog.Title>{action.name}</Dialog.Title>
                  </Dialog.Header>
                  <div class="flex flex-col gap-4">
                    {#each Object.entries(action.params ?? {}) as [key, param]}
                      <div class="flex flex-col gap-2">
                        <label for={key} class="text-sm font-medium">
                          {param.label}
                          {#if param.required}
                            <span class="text-destructive">*</span>
                          {/if}
                        </label>
                        <Input
                          id={key}
                          name={key}
                          type={param.type === "string" ? "text" : param.type}
                          placeholder={param.description}
                          required={param.required}
                          bind:value={actionParamValues[key]}
                        />
                      </div>
                    {/each}
                  </div>
                  <Button
                    onclick={() => {
                      selectedAction = action;
                      confirmAction();
                    }}
                  >
                    Confirm
                  </Button>
                </Dialog.Content>
              </Dialog.Root>
            {/each}
          </div>
          <Button variant="link" class="mt-4" onclick={() => (step = 1)}>Back</Button>
        {:else if step === 3}
          <Card.Header class="px-0">
            <Card.Title>Choose a reactive service</Card.Title>
          </Card.Header>
          <div class="grid grid-cols-3 gap-4">
            {#each services as service}
              {#if service.reactions.length > 0}
                <Button
                  variant="ghost"
                  class="w-full h-full p-4 border capitalize"
                  onclick={() => {
                    selectedReactionService = service;
                    step = 4;
                  }}
                >
                  {service.name}
                </Button>
              {/if}
            {/each}
          </div>
          <Button variant="link" class="mt-4" onclick={() => (step = 2)}>Back</Button>
        {:else if step === 4 && selectedReactionService}
          <Card.Header class="px-0">
            <Card.Title>Choose the reaction for {selectedReactionService.name}</Card.Title>
          </Card.Header>
          <div class="flex flex-col gap-2">
            {#each selectedReactionService.reactions as reaction}
              <Dialog.Root>
                <Dialog.Trigger>
                  <Button variant="ghost" class="w-full h-full justify-start text-left border">
                    <div class="flex flex-col items-start gap-1">
                      <div class="font-bold">{reaction.name}</div>
                      <div class="text-sm text-gray-500 font-normal">{reaction.description}</div>
                    </div>
                  </Button>
                </Dialog.Trigger>
                <Dialog.Content>
                  <Dialog.Header>
                    <Dialog.Title>{reaction.name}</Dialog.Title>
                  </Dialog.Header>
                  <div class="flex flex-col gap-4">
                    {#each Object.entries(reaction.params ?? {}) as [key, param]}
                      <div class="flex flex-col gap-2">
                        <label for={key} class="text-sm font-medium">
                          {param.label}
                          {#if param.required}
                            <span class="text-destructive">*</span>
                          {/if}
                        </label>
                        <Input
                          id={key}
                          name={key}
                          type={param.type === "string" ? "text" : param.type}
                          placeholder={param.description}
                          required={param.required}
                          bind:value={reactionParamValues[key]}
                        />
                      </div>
                    {/each}
                  </div>
                  <Button
                    onclick={() => {
                      selectedReaction = reaction;
                      confirmReaction();
                    }}
                  >
                    Confirm
                  </Button>
                </Dialog.Content>
              </Dialog.Root>
            {/each}
          </div>
          <Button variant="link" class="mt-4" onclick={() => (step = 3)}>Back</Button>
        {:else if step === 5}
          <Card.Header class="px-0">
            <Card.Title>Finalize Your AREA</Card.Title>
          </Card.Header>
          <form method="POST" class="flex flex-col gap-4" use:enhance>
            <Form.Field {form} name="name">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>
                      AREA Name
                      <span class="text-destructive">*</span>
                  </Form.Label>
                  <Input {...props} bind:value={$formData.name} placeholder="My Automation" />
                {/snippet}
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>

            <Form.Field {form} name="description">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>Description (Optional)</Form.Label>
                  <Input {...props} bind:value={$formData.description} placeholder="What does this automation do?" />
                {/snippet}
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>

            <div class="flex flex-col gap-2 p-4 bg-muted rounded-md">
              <p class="text-sm font-medium">Summary:</p>
              <p class="text-sm">
                <span class="font-bold">IF:</span>
                {selectedActionService?.name} - {selectedAction?.name}
              </p>
              <p class="text-sm">
                <span class="font-bold">THEN:</span>
                {selectedReactionService?.name} - {selectedReaction?.name}
              </p>
            </div>

            <div class="flex gap-2 mt-6">
              <Form.Button class="flex-1">Create AREA</Form.Button>
              <Button variant="link" type="button" onclick={() => (step = 4)}>Back</Button>
            </div>
          </form>
        {/if}
      </Card.Content>
    </Card.Root>
  {/await}
</div>
