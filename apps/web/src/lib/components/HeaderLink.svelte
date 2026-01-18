<script lang="ts">
  import type { Snippet } from "svelte";

  let { link, children, aria }: { link: string; children: Snippet; aria: string } = $props();
</script>

<a href={link} aria-label={aria}>
  <div
    class="size-11 rounded-xl bg-background flex justify-center items-center group-hover/icons:scale-110 hover:scale-135 hover:mx-2 transition-all ease-in-out group hover:border-purple-400 hover:shadow-[0_0_10px_rgba(192,132,252,0.4)] border border-transparent overflow-hidden relative duration-300"
  >
    <div
      class={`absolute inset-0 bg-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
    ></div>
    {@render children?.()}
  </div>
</a>
