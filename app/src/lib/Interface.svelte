<script lang="ts">
  import store from "../store";
  import SwapView from "./SwapView.svelte";
  import AddLiquidityView from "./AddLiquidityView.svelte";
  import RemoveLiquidity from "./RemoveLiquidity.svelte";
</script>

<style lang="scss">
  .interface-container {
    display: grid;
    place-items: center;
  }
</style>

<div class="interface-container">
  {#if $store.currentView === "swap"}
    <SwapView />
  {:else if $store.currentView === "add-liquidity"}
    <AddLiquidityView />
  {:else if $store.currentView === "remove-liquidity"}
    <RemoveLiquidity />
  {/if}
</div>
