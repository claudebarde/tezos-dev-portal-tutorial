<script lang="ts">
  import UserInput from "./UserInput.svelte";
  import type { token } from "../types";

  let inputXtz = "";
  let inputTzbtc = "";
  let sirsOutput = 0;

  const saveInput = ev => {
    const { token, val } = ev.detail;
    if (token === "XTZ" && val > 0) {
      inputXtz = val.toString();
      // TODO: calculate tzBTC amount
      inputTzbtc = "6969";
      sirsOutput = 69;
    } else if (token === "tzBTC" && val > 0) {
      inputTzbtc = val.toString();
      // TODO: calculate XTZ amount
      inputXtz = "6969";
      sirsOutput = 69;
    } else {
      inputXtz = "";
      inputTzbtc = "";
      sirsOutput = 0;
    }
  };
</script>

<style lang="scss">
  @import "../styles/settings.scss";

  .add-liquidity-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    border: solid 5px $powder-blue;
    border-radius: $std-border-radius;
    padding: calc(#{$padding} * 3);

    .add-liquidity-inputs {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
    }

    .add-liquidity-output {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;

      img {
        height: 28px;
        width: 28px;
      }
    }
  }
</style>

<div class="add-liquidity-container">
  <h1>Add liquidity</h1>
  <div class="add-liquidity-inputs">
    <UserInput
      token="XTZ"
      inputVal={inputXtz}
      logoPos="left"
      on:new-input={saveInput}
      disabled={false}
    />
    <UserInput
      token="tzBTC"
      inputVal={inputTzbtc}
      logoPos="right"
      on:new-input={saveInput}
      disabled={false}
    />
  </div>
  <div class="add-liquidity-output">
    <img src="images/SIRS.png" alt="SIRS" />
    <span>{sirsOutput} SIRS</span>
  </div>
  <button class="primary" disabled={!inputXtz || !inputTzbtc}>
    Add liquidity
  </button>
</div>
