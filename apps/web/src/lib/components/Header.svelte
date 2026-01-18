<script lang="ts">
  import { List, Plus, User } from "lucide-svelte";
  import HeaderLink from "$lib/components/HeaderLink.svelte";
  import Logo from "$lib/components/Logo.svelte";
</script>

<div class="sticky flex items-center justify-between p-4 w-full">
  <a aria-label="Home" href="/" class="flex items-center justify-center mx-2 text-primary hover:text-purple-400 transition-colors duration-300">
    <Logo class="h-8 w-auto" />
  </a>
  <div class="flex gap-2 justify-center items-center group/icons">
    <HeaderLink aria="Create Area" link="/areas/create">
      <Plus />
    </HeaderLink>
    <HeaderLink aria="Area Manager" link="/areas">
      <List />
    </HeaderLink>
    <HeaderLink aria="Profile" link="/profile">
      <User />
    </HeaderLink>
  </div>
</div>
