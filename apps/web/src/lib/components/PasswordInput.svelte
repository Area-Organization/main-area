<script>
	import Button from './ui/button/button.svelte';
	import Input from './ui/input/input.svelte';

	var visible = $state(false);
    let { value = $bindable() } = $props();
</script>

<div class="relative">
	<Input type={visible ? 'text' : 'password'} bind:value={value} class="pr-9" />
	<Button
		variant="ghost"
		size="icon"
		onclick={() => (visible = !visible)}
		class="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
	>
		{#if visible}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="lucide lucide-eye-closed-icon lucide-eye-closed"
				><path d="m15 18-.722-3.25" /><path d="M2 8a10.645 10.645 0 0 0 20 0" /><path
					d="m20 15-1.726-2.05"
				/><path d="m4 15 1.726-2.05" /><path d="m9 18 .722-3.25" /></svg
			>
		{:else}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="lucide lucide-eye-icon lucide-eye"
				><path
					d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
				/><circle cx="12" cy="12" r="3" /></svg
			>
		{/if}
		<span class="sr-only">{visible ? 'Hide password' : 'Show password'}</span>
	</Button>
</div>
