<script lang="ts">
  import store from "../store";
</script>

<style lang="scss">
  @import "../styles/settings.scss";

  .sidebar {
    height: 100%;
    border-right: solid 3px $powder-blue;
    display: grid;
    grid-template-rows: 20% 70% 10%;
    gap: 20px;

    .sidebar__wallet {
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .sidebar__dex {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
      gap: 10px;
    }

    .sidebar__footer {
      text-align: center;
    }
  }
</style>

<div class="sidebar">
  <div class="sidebar__wallet">
    <button class="wallet-button">Connect wallet</button>
  </div>
  <div class="sidebar__dex">
    <button class="sidebar-button" on:click={() => store.updateView("swap")}>
      Swap
    </button>
    <button
      class="sidebar-button"
      on:click={() => store.updateView("add-liquidity")}
    >
      Add liquidity
    </button>
    <button
      class="sidebar-button"
      on:click={() => store.updateView("remove-liquidity")}
    >
      Remove liquidity
    </button>
  </div>
  <div class="sidebar__footer">Liquidity Baking</div>
</div>
