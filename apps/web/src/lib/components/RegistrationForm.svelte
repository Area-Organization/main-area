<script lang="ts">
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { registrationSchema } from "@/schemas/auth.schemas";
  import PasswordInput from "./PasswordInput.svelte";
  import { typebox } from "sveltekit-superforms/adapters";
  import { superForm } from "sveltekit-superforms";
  import { page } from "$app/state";
  import * as Card from "$lib/components/ui/card/index.js";
  import { auth } from "@/auth-client";

  const redirectTo = page.url.searchParams.get("redirectTo")
    ? encodeURIComponent(page.url.searchParams.get("redirectTo")!)
    : null;

  const form = superForm(
    { name: "", email: "", password: "", confirmPassword: "" },
    {
      SPA: true,
      validators: typebox(registrationSchema),
      async onUpdate({ form }) {
        if (!form.valid) return;

        try {
          if (form.data.password !== form.data.confirmPassword) {
            console.error("Passwords must match");
            return;
          }

          const { data, error } = await auth.signUpEmail(
            form.data.email,
            form.data.password,
            form.data.name,
            redirectTo ? `${decodeURIComponent(redirectTo)}` : "/profile"
          );

          if (error) {
            console.error("Registration failed:", error);
            return;
          }
          console.log("Registration successful:", data);
        } catch (error) {
          console.error("Registration error:", error);
        }
      }
    }
  );

  const { form: formData, enhance } = form;
</script>

<Card.Root class="w-100">
  <Card.Header class="sm:justify-center text-center text-2xl">
    <Card.Title class="uppercase">Registration</Card.Title>
    <Card.Description>Welcome!</Card.Description>
  </Card.Header>
  <Card.Content>
    <form method="POST" class="w-full flex flex-col gap-2" use:enhance>
      <Form.Field {form} name="name">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Name</Form.Label>
            <Input {...props} bind:value={$formData.name} />
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
        <p class="text-muted-foreground text-sm">
          Already have an account?
          <a href={`/login${redirectTo ? `?redirectTo=${redirectTo}` : ""}`} class="underline"> Login</a>
        </p>
        <Form.Button class="flex-1">Register</Form.Button>
      </div>
    </form>
  </Card.Content>
</Card.Root>
