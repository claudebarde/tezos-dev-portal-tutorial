<style lang="scss">
  @import "../styles/settings.scss";

  .sidebar {
    height: 100%;
    border-right: solid 3px $powder-blue;
    display: grid;
    grid-template-rows: 10% 80% 10%;
    gap: 20px;

    .sidebar__wallet {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .sidebar__dex {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
      gap: 10px;
    }
  }
</style>

<div class="sidebar">
  <div class="sidebar__wallet">
    <button class="wallet-button">Wallet</button>
  </div>
  <div class="sidebar__dex">
    <button class="sidebar-button">Swap</button>
    <button class="sidebar-button">Add liquidity</button>
    <button class="sidebar-button">Remove liquidity</button>
  </div>
  <div class="sidebar__footer">footer</div>
</div>
