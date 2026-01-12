<script>
	import { Eye, EyeClosed, Proportions } from 'lucide-svelte';
	import Button from './ui/button/button.svelte';
	import Input from './ui/input/input.svelte';

	let visible = $state(false);
	let { value = $bindable(), ...others } = $props();
</script>

<div class="relative">
	<Input type={visible ? 'text' : 'password'} bind:value class="pr-9" id={others?.id} placeholder={others?.placeholder} />
	<Button
		variant="ghost"
		size="icon"
		onclick={() => (visible = !visible)}
		class="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
	>
		{#if visible}
			<Eye />
		{:else}
			<EyeClosed />
		{/if}
		<span class="sr-only">{visible ? 'Hide password' : 'Show password'}</span>
	</Button>
</div>
