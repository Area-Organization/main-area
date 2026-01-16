<script lang="ts">
  import { type ParameterDTO } from "@area/types";
  import { Input } from "./ui/input";

  interface Props {
    key: string;
    param: ParameterDTO;
    value: string;
  }

  let { key, param, value = $bindable() }: Props = $props();
</script>

<div class="flex flex-col gap-2">
  <div class="flex justify-between items-center">
    {param.label}
    {#if param.required}
      <p class="text-red-400">Required</p>
    {/if}
  </div>
  {#if param.type == "string"}
    <Input
      id={key}
      name={key}
      type={param.type === "string" ? "text" : param.type}
      placeholder={param.description}
      required={param.required}
      bind:value
    />
  {/if}
</div>
