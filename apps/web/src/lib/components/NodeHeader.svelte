<script lang="ts">
  import { Check, X } from "lucide-svelte";
  import * as Card from "$lib/components/ui/card/index.js";

  let { isValid, name, handleDelete }: { isValid: boolean; name: string; handleDelete: Function } = $props();
</script>

<Card.Header class="flex flex-row justify-between items-center">
  <div class="flex gap-2 items-center">
    <Check size={20} class={`transition-colors ${isValid ? "text-green-500" : "text-muted-foreground/20"}`} />
    <Card.Title class="uppercase">{name}</Card.Title>
  </div>
  <button
    onmousedown={(e) => {
      e.stopPropagation();
      handleDelete();
    }}
    class="nodrag text-muted-foreground hover:text-red-500 cursor-pointer transition-colors"
    title="Delete node"
  >
    <X size={20} />
  </button>
</Card.Header>
