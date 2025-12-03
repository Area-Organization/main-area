<script lang="ts" module>
	import { z } from 'zod';

	const formSchema = z.object({
		username: z.string().min(2).max(50),
		email: z.email(),
		password: z.string().min(7),
		confirmPassword: z.string().min(7)
	});
</script>

<script lang="ts">
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import PasswordInput from './PasswordInput.svelte';

	const form = superForm(defaults(zod4(formSchema)), {
		validators: zod4(formSchema),
		SPA: true
	});

	const { form: formData, enhance } = form;
</script>

<div
	class="flex p-5 rounded-2xl border border-border w-[25%] justify-center items-center flex-col gap-5"
>
	<h1 class="text-2xl font-bold uppercase">Registration</h1>
	<form method="POST" class="w-full flex flex-col gap-2" use:enhance>
		<Form.Field {form} name="username">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Username</Form.Label>
					<Input {...props} bind:value={$formData.username} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="email">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Email</Form.Label>
					<Input {...props} bind:value={$formData.email} type="email" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="password">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Password</Form.Label>
					<PasswordInput {...props} bind:value={$formData.password} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="confirmPassword">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Confirm Password</Form.Label>
					<PasswordInput {...props} bind:value={$formData.confirmPassword} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<div class="mt-10 flex flex-col justify-center items-center gap-2">
			<p>
				Already have an account?
				<a href="/login" class="underline"> Login</a>
			</p>
			<Form.Button class="flex-1">Register</Form.Button>
		</div>
	</form>
</div>
