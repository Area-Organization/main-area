<script lang="ts">
  import type { ActionDTO } from "@area/types";

  interface Props {
    info: ActionDTO;
    type: "Action" | "Reaction"
  }

  let { info, type }: Props = $props();
</script>

<div class="">
    {info.name}
</div>
