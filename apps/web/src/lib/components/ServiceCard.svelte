<script lang="ts">
  import type { OAuth2AuthUrlResponseType, ServiceDTO, UserConnectionSchemaType } from "@area/types";
  import ServiceIcon from "./ServiceIcon.svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Switch } from "./ui/switch";
  import { getServiceAuthUrl } from "@/api/getServiceAuthUrl";
  import { onMount } from "svelte";

  interface Props {
    service: ServiceDTO;
    connections: UserConnectionSchemaType[];
  }

  let { service, connections }: Props = $props();

  const isLinked: boolean = $derived(
    connections.find((con) => {
      return con.serviceName == service.name;
    }) != null
  );

  let authPromise = $state<Promise<OAuth2AuthUrlResponseType>>();

  onMount(() => {
    authPromise = getServiceAuthUrl(service.name, window.location.href);
  });
</script>

{#await authPromise}
  <Card.Root class="w-xs h-full">
    <Card.Header>
      <div class="flex w-full justify-between items-center">
        <div class="flex gap-5 items-center">
          <ServiceIcon name={service.name} />
          <Card.Title class="capitalize">{service.name}</Card.Title>
        </div>
        <Switch
          checked={false}
          onclick={(e: MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        />
      </div>
      <Card.Description>{service.description}</Card.Description>
    </Card.Header>
  </Card.Root>
{:then auth}
  <a
    aria-label="{service.name} connection"
    href={auth?.authUrl}
    class={`group transition-all ${isLinked ? "pointer-events-none cursor-auto" : ""}`}
  >
    <Card.Root class={`w-xs h-full ${isLinked ? "bg-muted text-muted-foreground" : ""}`}>
      <Card.Header>
        <div class="flex w-full justify-between items-center">
          <div class="flex gap-5 items-center">
            <ServiceIcon name={service.name} />
            <Card.Title class="capitalize">{service.name}</Card.Title>
          </div>
          <Switch
            checked={isLinked}
            onclick={(e: MouseEvent) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          />
        </div>
        <Card.Description>{service.description}</Card.Description>
      </Card.Header>
    </Card.Root>
  </a>
{/await}
