<script lang="ts">
  import { List, Plus, User } from "lucide-svelte";
  import HeaderLink from "./HeaderLink.svelte";
</script>

<div class="sticky flex items-center justify-between p-4 w-full">
  <a href="/" class="flex items-center justify-center mx-2">
    <h1>Logo</h1>
  </a>
  <div class="flex gap-2 justify-center items-center group/icons">
    <HeaderLink link="/areas/create">
      <Plus />
    </HeaderLink>
    <HeaderLink link="/areas">
      <List />
    </HeaderLink>
    <HeaderLink link="/profile">
      <User />
    </HeaderLink>
  </div>
</div>
