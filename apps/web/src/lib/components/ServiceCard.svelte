<script lang="ts">
  import type { IService } from "@area/types";
  import ServiceIcon from "./ServiceIcon.svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Switch } from "./ui/switch";

  interface Props {
    service: IService;
  }

  let { service }: Props = $props();
</script>

<a aria-label="{service.name} connection" href={service.oauth?.authorizationUrl} class="group transition-all">
  <Card.Root class="w-xs h-full">
    <Card.Header>
      <div class="flex w-full justify-between items-center">
        <div class="flex gap-5 items-center">
          <ServiceIcon name={service.name} />
          <Card.Title>{service.name}</Card.Title>
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
</a>
