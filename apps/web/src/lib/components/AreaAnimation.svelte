<script lang="ts">
  import gsap from "gsap";

  let tl = gsap.timeline();

  function playAnim() {
    if (!tl.isActive()) tl.play(true);
  }

  function pauseAnim() {
    if (tl.isActive()) tl.pause();
  }

  document.querySelector(".area-anim")?.addEventListener("mouseenter", playAnim);
  document.querySelector(".area-anim")?.addEventListener("mouseleave", pauseAnim);
</script>
