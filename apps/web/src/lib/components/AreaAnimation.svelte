<script lang="ts">
  import type { AreaActionType, AreaReactionType } from "@area/types";
  import { onMount } from "svelte";
  import gsap from "gsap";
  import ServiceIcon from "$lib/components/ServiceIcon.svelte";

  let { action, reactions }: { action: AreaActionType; reactions: AreaReactionType[] } = $props();

  let tl = gsap.timeline();

  onMount(() => {
    tl.to(".line", {
      strokeDashoffset: "-=10",
      duration: 1,
      repeat: -1,
      ease: "none"
    });

    tl.play();
  });
</script>

<div class="flex area-anim items-center justify-center">
  <ServiceIcon name={action.serviceName} />

  <svg width="75" height="12" viewBox="0 0 75 12" xmlns="http://www.w3.org/2000/svg">
    <line
		class="line"
      x1="0"
      y1="6"
      x2="75"
      y2="6"
      stroke-linecap="round"
      stroke-dasharray="5"
      stroke-dashoffset="3"
      stroke="currentColor"
      stroke-width="2"
    />
  </svg>

  {#each reactions as reaction, i}
    <ServiceIcon name={reaction.serviceName} />
    {#if i != reactions.length - 1}
      <svg width="75" height="12" viewBox="0 0 75 12" xmlns="http://www.w3.org/2000/svg">
        <line
          class="line"
          x1="0"
          y1="6"
          x2="75"
          y2="6"
          stroke-linecap="round"
          stroke-dasharray="5"
          stroke-dashoffset="3"
          stroke="currentColor"
          stroke-width="2"
        />
      </svg>
    {/if}
  {/each}
</div>
