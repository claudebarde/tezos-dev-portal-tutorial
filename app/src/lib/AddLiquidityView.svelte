<script lang="ts">
  import store from "../store";
  import UserInput from "./UserInput.svelte";
  import type { token } from "../types";
  import {
    xtzToTokenTokenOutput,
    tokenToXtzXtzOutput,
    addLiquidityLiquidityCreated
  } from "../lbUtils";

  let inputXtz = "";
  let inputTzbtc = "";
  let sirsOutput = 0;

  const saveInput = ev => {
    const { token, val }: { token: token; val: number | null } = ev.detail;
    if (token === "XTZ" && val && val > 0) {
      let tzbtcAmount = xtzToTokenTokenOutput({
        xtzIn: val * 10 ** 6,
        xtzPool: $store.dexInfo.xtzPool,
        tokenPool: $store.dexInfo.tokenPool
      });
      if (tzbtcAmount) {
        inputTzbtc = tzbtcAmount.dividedBy(10 ** 8).toPrecision(6);
      } else {
        inputTzbtc = "";
      }

      const liquidityCreated = addLiquidityLiquidityCreated({
        xtzIn: val * 10 ** 6,
        xtzPool: $store.dexInfo.xtzPool,
        totalLiquidity: $store.dexInfo.lqtTotal
      });
      if (liquidityCreated) {
        sirsOutput = liquidityCreated.decimalPlaces(4).toNumber();
      } else {
        sirsOutput = 0;
      }
    } else if (token === "tzBTC" && val && val > 0) {
      let xtzAmount = tokenToXtzXtzOutput({
        tokenIn: val * 10 ** 8,
        xtzPool: $store.dexInfo.xtzPool,
        tokenPool: $store.dexInfo.tokenPool
      });
      if (xtzAmount) {
        inputXtz = xtzAmount.dividedBy(10 ** 6).toPrecision(8);

        const liquidityCreated = addLiquidityLiquidityCreated({
          xtzIn: xtzAmount,
          xtzPool: $store.dexInfo.xtzPool,
          totalLiquidity: $store.dexInfo.lqtTotal
        });
        if (liquidityCreated) {
          sirsOutput = liquidityCreated.decimalPlaces(4).toNumber();
        } else {
          sirsOutput = 0;
        }
      } else {
        inputXtz = "";
      }
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
    border: solid 3px darken($powder-blue, 10);
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

<div class="container add-liquidity-container">
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
