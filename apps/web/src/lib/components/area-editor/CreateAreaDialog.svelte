<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import Button, { buttonVariants } from "../ui/button/button.svelte";
  import Input from "../ui/input/input.svelte";

  let {
    open = $bindable(false),
    disabled,
    onsubmit,
    buttonText = "Create Area",
    dialogTitle = "Create your Area",
    validateButtonText = "Create",
    baseName = "",
    baseDesc = ""
  } = $props<{
    open: boolean;
    disabled: boolean;
    onsubmit: (name: string, desc: string) => void;
    buttonText?: string;
    dialogTitle?: string;
    validateButtonText?: string;
    baseName?: string;
    baseDesc?: string;
  }>();

  let name = $state(baseName);
  let desc = $state(baseDesc);

  $effect(() => {
    name = baseName;
    desc = baseDesc;
  });

  function handleSubmit() {
    onsubmit(name, desc);
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger
    class={`${buttonVariants({ variant: "default" })} absolute bottom-5 left-1/2 -translate-x-1/2 z-10 text-card!`}
    {disabled}
  >
    {buttonText}
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{dialogTitle}</Dialog.Title>
    </Dialog.Header>
    <div class="flex flex-col gap-4 py-2">
      <div class="space-y-1">
        <label
          for="area-name"
          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Area Name <span class="text-red-500">*</span>
        </label>
        <Input id="area-name" placeholder="e.g. Daily Sync" bind:value={name} />
      </div>

      <div class="space-y-1">
        <label
          for="area-desc"
          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Description <span class="text-muted-foreground font-normal text-xs">(optional)</span>
        </label>
        <Input id="area-desc" placeholder="What does this area do?" bind:value={desc} />
      </div>
    </div>
    <Dialog.Footer class="flex justify-center items-center sm:justify-center">
      <Button variant="default" disabled={!name || name.trim() === ""} onclick={handleSubmit} class="text-card!">
        {validateButtonText}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
