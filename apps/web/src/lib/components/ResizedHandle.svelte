<script lang="ts">
  import { Handle, Position } from "@xyflow/svelte";

  let { position, type }: { position: Position, type: "target" | "source" } = $props();
</script>

<div
  role="button"
  tabindex="-1"
  class="nodrag"
  draggable={true}
  onmousedown={(e) => e.stopPropagation()}
  ontouchstart={(e) => e.stopPropagation()}
  onpointerdown={(e) => e.stopPropagation()}
  ondragstart={(e) => {
    e.preventDefault();
    e.stopPropagation();
  }}
>
  <Handle type={type} position={position} style="width: 12px; height: 12px;" />
</div>
