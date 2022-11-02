<script lang="ts">
  import store from "../store";
  import { displayTokenAmount } from "../utils";
</script>

<style lang="scss">
  @import "../styles/settings.scss";

  .stats-container {
    padding: $padding;
    width: 60%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: solid 3px darken($powder-blue, 10);
    border-radius: $std-border-radius;
    margin: 20px;
    background-color: $powder-blue;
    width: 70%;

    .stats-container__info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      & div:last-child {
        font-weight: bold;
      }
    }
  }
</style>

<div class="stats-container">
  {#if $store.dexInfo}
    <div class="stats-container__info">
      <div>XTZ pool</div>
      <div>{displayTokenAmount($store.dexInfo.xtzPool, "XTZ")}</div>
    </div>
    <div class="stats-container__info">
      <div>tzBTC pool</div>
      <div>{displayTokenAmount($store.dexInfo.tokenPool, "tzBTC")}</div>
    </div>
    <div class="stats-container__info">
      <div>LQT pool</div>
      <div>{displayTokenAmount($store.dexInfo.lqtTotal, "SIRS")}</div>
    </div>
    <div class="stats-container__info">
      <div>Total value</div>
      <div>TODO</div>
    </div>
  {:else}
    Loading Sirius DEX details...
  {/if}
</div>
