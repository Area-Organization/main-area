<script lang="ts">
  import { authClient } from "@/auth-client";
  import { User } from "lucide-svelte";

  const session = authClient.useSession();
  const userPath = $derived(($session.data?.session) ? "/profile" : "/login");
</script>

<div class="sticky flex items-center justify-center w-full h-20">
  <div class="h-[80%] w-[35%] bg-card rounded-2xl grid grid-cols-5 mx-5 justify-items-center items-center">
    <div class="size-11 rounded-xl bg-background"></div>
    <div class="size-11 rounded-xl bg-background"></div>
    <a href="/">
      <h1>Logo</h1>
    </a>
    <div class="size-11 rounded-xl bg-background"></div>
    <a href={userPath} aria-label="profile">
      <div class="size-11 rounded-xl bg-background flex justify-center items-center">
        <User />
      </div>
    </a>
  </div>
</div>
