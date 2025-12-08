<script lang="ts">
  import { defaultValues, superForm } from "sveltekit-superforms";
  import { typebox } from "sveltekit-superforms/adapters";
  import { loginSchema } from "@/schemas/auth.shemas";
  import { authClient } from "@/auth-client";
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import PasswordInput from "./PasswordInput.svelte";

  const form = superForm(
    { email: "", password: "", rememberMe: false },
    {
      SPA: true,
      validators: typebox(loginSchema),
      async onUpdate({ form }) {
        if (!form.valid) return;

        try {
          const { data, error } = await authClient.signIn.email({
            email: form.data.email,
            password: form.data.password,
            rememberMe: form.data.rememberMe,
            callbackURL: "/profile"
          });

          if (error) {
            console.error("Login failed:", error);
            return;
          }

          console.log("Login successful:", data);
        } catch (error) {
          console.error("Login error:", error);
        }
      }
    }
  );

  const { form: formData, enhance } = form;
</script>

<div class="flex p-5 rounded-2xl border border-border w-[25%] justify-center items-center flex-col gap-5">
  <h1 class="text-2xl font-bold uppercase">Login</h1>
  <form method="POST" class="w-full flex flex-col" use:enhance>
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
          <div class="flex justify-between w-full">
            <Form.Label>Password</Form.Label>
            <a href="/forgot-password" class="text-sm hover:underline transition-all text-muted-foreground"
              >Forgot your password?</a
            >
          </div>
          <PasswordInput {...props} bind:value={$formData.password} />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="rememberMe">
      <Form.Control>
        {#snippet children()}
          <div class="flex w-full justify-center gap-2 mt-5">
            <Checkbox onCheckedChange={() => ($formData.rememberMe = !$formData.rememberMe)} />
            <Form.Label>Remember me?</Form.Label>
          </div>
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <div class="mt-10 flex flex-col justify-center items-center gap-2">
      <p class="text-muted-foreground text-sm">
        No account?
        <a href="/register" class="underline"> Register</a>
      </p>
      <Form.Button class="flex-1">Login</Form.Button>
    </div>
  </form>
</div>
