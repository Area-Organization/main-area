<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import type { Snippet } from "svelte";

  let {
    title,
    stat,
    color,
    shadow,
    children
  }: { title: string; stat: number; color: "cyan" | "green" | "teal" | "emerald"; shadow: string; children: Snippet } =
    $props();

  const colorMap: Record<string, { border: string; bg: string }> = {
    cyan: { border: "hover:border-cyan-400", bg: "bg-cyan-400/10" },
    teal: { border: "hover:border-teal-400", bg: "bg-teal-400/10" },
    emerald: { border: "hover:border-emerald-400", bg: "bg-emerald-400/10" },
    green: { border: "hover:border-green-400", bg: "bg-green-400/10" },
  };

  const activeColor = $derived(colorMap[color] ?? colorMap["cyan"]);
</script>

<Card.Root
  class={`relative overflow-hidden transition-all duration-300 group ${activeColor.border} hover:shadow-[0_0_20px_var(--shadow-color)] border border-transparent`}
  style="--shadow-color: rgba({shadow})"
>
  <div
    class={`absolute inset-0 ${activeColor.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
  ></div>

  <Card.Header class="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
    <Card.Title class="text-sm font-medium">{title}</Card.Title>
    {@render children?.()}
  </Card.Header>
  <Card.Content class="relative z-10">
    <div class="text-2xl font-bold">{stat}</div>
  </Card.Content>
</Card.Root>
