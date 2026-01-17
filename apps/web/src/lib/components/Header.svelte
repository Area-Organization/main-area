<script lang="ts">
  import { Plus, User } from "lucide-svelte";
</script>

<div class="sticky flex items-center justify-center w-full h-20">
  <div class="h-[80%] w-[15%] bg-card rounded-2xl grid grid-cols-3 mx-5 justify-items-center items-center">
    <a href="/areas/create" aria-label="create new area">
      <div class="size-11 rounded-xl bg-background flex justify-center items-center">
        <Plus />
      </div>
    </a>
    <a href="/">
      <h1>Logo</h1>
    </a>
    <a href="/profile" aria-label="profile">
      <div class="size-11 rounded-xl bg-background flex justify-center items-center">
        <User />
      </div>
    </a>
  </div>
</div>
