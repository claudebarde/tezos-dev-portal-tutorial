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
    const { token, val } = ev.detail;
    if (token === tokenFrom && val > 0) {
      inputFrom = val.toString();
      inputTo = "6969";
      // TODO: calculate the corresponding amount for tokenTo
    } else {
      inputFrom = "";
      inputTo = "";
    }
  };
</script>

<style lang="scss">
  @import "../styles/settings.scss";

  .swap-container {
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

<div class="container swap-container">
  <h1>Swap</h1>
  <div class="swap-inputs">
    <UserInput
      token={tokenFrom}
      inputVal={inputFrom}
      logoPos="left"
      on:new-input={saveInput}
      disabled={false}
    />
    <button class="transparent" on:click={switchTokens}>
      <img class="token-selector" src="images/repeat.svg" alt="switch" />
    </button>
    <UserInput
      token={tokenTo}
      inputVal={inputTo}
      logoPos="right"
      on:new-input={saveInput}
      disabled={true}
    />
  </div>
  <button class="primary" disabled={!inputFrom || !inputTo}>Swap</button>
</div>
