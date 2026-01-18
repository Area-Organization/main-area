<script lang="ts">
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { registrationSchema } from "$lib/schemas/auth.schemas";
  import PasswordInput from "./PasswordInput.svelte";
  import { typebox } from "sveltekit-superforms/adapters";
  import { superForm } from "sveltekit-superforms";
  import * as Card from "$lib/components/ui/card/index.js";
  import { goto } from "$app/navigation";
  import OAuthButtons from "./OAuthButtons.svelte";
  import { auth } from "$lib/auth-client";
  import { ShieldCheck, LoaderCircle, ArrowLeft, CircleCheck } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { toast } from "svelte-sonner";

  let step = $state("register");
  let email = $state("");
  let otpCode = $state("");
  let isVerifying = $state(false);

  const form = superForm(
    { name: "", email: "", password: "", confirmPassword: "" },
    {
      SPA: true,
      validators: typebox(registrationSchema),
      async onUpdate({ form }) {
        if (!form.valid) return;

        try {
          if (form.data.password !== form.data.confirmPassword) {
            toast.error("Passwords must match");
            return;
          }

          const { data, error } = await auth.signUpEmail({
            email: form.data.email,
            password: form.data.password,
            name: form.data.name
          });

          if (error) {
            toast.error(error.message || "Registration failed");
            return;
          }

          email = form.data.email;
          step = "verify";
          toast.success("Account created! Check your email for the code.");
        } catch (error) {
          console.error("Registration error:", error);
          toast.error("An unexpected error occurred");
        }
      }
    }
  );

  const { form: formData, enhance, delayed } = form;

  async function handleVerifyOTP() {
    if (otpCode.length < 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }

    isVerifying = true;
    try {
      const { data, error } = await auth.emailOtp.verifyEmail({
        email: email,
        otp: otpCode
      });

      if (error) {
        toast.error(error.message || "Invalid or expired code");
        isVerifying = false;
      } else {
        toast.success("Email verified! Welcome to AREA.");
        goto("/");
      }
    } catch (err) {
      toast.error("Verification failed");
      isVerifying = false;
    }
  }
</script>

<Card.Root class="w-full max-w-md overflow-hidden transition-all duration-300">
  {#if step === "register"}
    <Card.Header class="text-center">
      <Card.Title class="text-2xl font-bold tracking-tight uppercase">Create Account</Card.Title>
      <Card.Description>Join the AREA platform and start automating.</Card.Description>
    </Card.Header>
    <Card.Content>
      <form method="POST" class="w-full flex flex-col gap-3" use:enhance>
        <Form.Field {form} name="name">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Full Name</Form.Label>
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

        <Button type="submit" class="w-full mt-4 text-card" disabled={$delayed}>
          {#if $delayed}
            <LoaderCircle class="mr-2 animate-spin" size={16} />
            Creating account...
          {:else}
            Create Account
          {/if}
        </Button>

        <p class="text-center text-sm text-muted-foreground mt-2">
          Already have an account?
          <a href="/login" class="text-primary hover:underline font-medium">Login</a>
        </p>

        <OAuthButtons />
      </form>
    </Card.Content>
  {:else}
    <Card.Content class="pt-10 pb-8 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
      <div
        class="size-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 border border-primary/20 shadow-sm"
      >
        <ShieldCheck size={40} strokeWidth={1.5} />
      </div>
      <Card.Title class="text-3xl font-bold mb-2">Verify your identity</Card.Title>
      <p class="text-muted-foreground text-sm max-w-300px mb-8">
        We've sent a 6-digit verification code to <br />
        <span class="text-foreground font-semibold">{email}</span>
      </p>

      <div class="w-full space-y-6">
        <Input
          type="text"
          maxlength={6}
          bind:value={otpCode}
          placeholder="000000"
          class="text-center text-4xl h-20 tracking-[0.5em] font-mono border-2 focus:ring-primary"
        />

        <div class="flex flex-col gap-3">
          <Button class="w-full h-12 text-lg text-card" onclick={handleVerifyOTP} disabled={isVerifying || otpCode.length < 6}>
            {#if isVerifying}
              <LoaderCircle class="mr-2 animate-spin" size={20} />
              Verifying...
            {:else}
              Confirm Code
            {/if}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            class="text-muted-foreground hover:text-foreground"
            onclick={() => (step = "register")}
          >
            <ArrowLeft size={14} class="mr-2" />
            Use a different email
          </Button>
        </div>
      </div>

      <div class="mt-12 pt-6 border-t border-border w-full flex items-center justify-center gap-2">
        <CircleCheck size={14} class="text-green-500" />
        <span class="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Secure Verification</span>
      </div>
    </Card.Content>
  {/if}
</Card.Root>
