<script lang="ts">
  import { onMount } from "svelte";
  let canvas: HTMLCanvasElement;

  onMount(() => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
</script>

<main>
  <canvas
    bind:this={canvas}
    id="main-canvas"
    class="glslCanvas"
    width="1000px"
    height="1000px"
    data-fragment-url="./fragments/starry_pool.frag"
  />
</main>

