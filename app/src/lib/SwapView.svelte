<script lang="ts">
  import UserInput from "./UserInput.svelte";
  import type { token } from "../types";

  let tokenFrom: token = "XTZ";
  let tokenTo: token = "tzBTC";
  let inputFrom = "";
  let inputTo = "";

  const switchTokens = () => {
    if (tokenFrom === "XTZ") {
      tokenFrom = "tzBTC";
      tokenTo = "XTZ";
    } else {
      tokenFrom = "XTZ";
      tokenTo = "tzBTC";
    }
  };

  const saveInput = ev => {
    console.log({ tokenFrom, ...ev.detail });
  };
</script>

<style lang="scss">
  @import "../styles/settings.scss";

  .swap-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    border: solid 5px $powder-blue;
    border-radius: $std-border-radius;
    padding: calc(#{$padding} * 3);

    .swap-inputs {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
    }

    .token-selector {
      cursor: pointer;
      border: solid 2px transparent;
      border-radius: 50%;
      padding: 10px;
      transition: 0.3s;

      &:hover {
        border-color: $powder-blue;
        transform: rotate(180deg);
      }
    }
  }
</style>

<div class="swap-container">
  <h1>Swap</h1>
  <div class="swap-inputs">
    <UserInput
      token={tokenFrom}
      logoPos="left"
      on:new-input={saveInput}
      disabled={false}
    />
    <button class="transparent" on:click={switchTokens}>
      <img class="token-selector" src="images/repeat.svg" alt="switch" />
    </button>
    <UserInput
      token={tokenTo}
      logoPos="right"
      on:new-input={saveInput}
      disabled={true}
    />
  </div>
  <button class="primary">Swap</button>
</div>
