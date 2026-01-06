<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import Button, { buttonVariants } from "../ui/button/button.svelte";
  import Input from "../ui/input/input.svelte";

  let {
    open = $bindable(false),
    disabled,
    onsubmit
  } = $props<{
    open: boolean;
    disabled: boolean;
    onsubmit: (name: string, desc: string) => void;
  }>();

  let name = $state("");
  let desc = $state("");

  function handleSubmit() {
    onsubmit(name, desc);
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger
    class={`${buttonVariants({ variant: "default" })} absolute bottom-5 left-1/2 -translate-x-1/2 z-10`}
    {disabled}
  >
    Create Area
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Create your Area</Dialog.Title>
    </Dialog.Header>
    <div class="flex flex-col items-center gap-2">
      <Input id="area-name" placeholder="Area Name" bind:value={name} />
      <Input id="area-desc" placeholder="Description" bind:value={desc} />
    </div>
    <Dialog.Footer class="flex justify-center items-center sm:justify-center">
      <Button variant="default" disabled={name == "" || desc == ""} onclick={handleSubmit}>Create</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
