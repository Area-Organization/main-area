<script lang="ts">
  import { superForm } from "sveltekit-superforms";
  import * as Card from "$lib/components/ui/card/index.js";
  import { typebox } from "sveltekit-superforms/adapters";
  import { loginSchema } from "$lib/schemas/auth.schemas";
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import PasswordInput from "$lib/components/PasswordInput.svelte";
  import OAuthButtons from "$lib/components/OAuthButtons.svelte";
  import { page } from "$app/state";
  import { auth } from "$lib/auth-client";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";

  const redirectTo = page.url.searchParams.get("redirectTo")
    ? encodeURIComponent(page.url.searchParams.get("redirectTo")!)
    : null;

  const form = superForm(
    { email: "", password: "", rememberMe: false },
    {
      SPA: true,
      validators: typebox(loginSchema),
      async onUpdate({ form }) {
        if (!form.valid) return;

        try {
          const { data, error } = await auth.signInEmail({
            email: form.data.email,
            password: form.data.password,
            callbackURL: redirectTo ? decodeURIComponent(redirectTo) : "/"
          });

          if (error) {
            toast.error(`Login failed: ${error.message}.`);
            return;
          }

          goto(redirectTo ? decodeURIComponent(redirectTo) : "/");
        } catch (error) {
          toast.error(`Login error: ${error}.`);
        }
      }
    }
  );

  const { form: formData, enhance } = form;
</script>

<Card.Root class="w-100">
  <Card.Header class="sm:justify-center text-center text-2xl">
    <Card.Title class="uppercase">Login</Card.Title>
    <Card.Description>Welcome back!</Card.Description>
  </Card.Header>
  <Card.Content>
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
              <!-- <a href="/forgot-password" class="text-sm hover:underline transition-all text-muted-foreground"
                >Forgot your password?</a
              > -->
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
          <a href={`/register${redirectTo ? `?redirectTo=${redirectTo}` : ""}`} class="underline"> Register</a>
        </p>
        <Form.Button class="flex-1 w-full">Login</Form.Button>
      </div>

      <OAuthButtons />
    </form>
  </Card.Content>
</Card.Root>
