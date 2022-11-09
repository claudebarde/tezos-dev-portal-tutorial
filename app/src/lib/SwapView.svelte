<script lang="ts">
  import { onMount } from "svelte";
  import UserInput from "./UserInput.svelte";
  import type { token } from "../types";
  import { xtzToTokenTokenOutput, tokenToXtzXtzOutput } from "../lbUtils";
  import store from "../store";
  import { displayTokenAmount } from "../utils";

  let tokenFrom: token = "XTZ";
  let tokenTo: token = "tzBTC";
  let inputFrom = "";
  let inputTo = "";
  let xtzToTzbtc = 0;
  let tzbtcToXtz = 0;

  const switchTokens = () => {
    if (tokenFrom === "XTZ") {
      tokenFrom = "tzBTC";
      tokenTo = "XTZ";
      // switches the values
      if (inputFrom && inputTo) {
        const tmpInputTo = inputTo;
        inputTo = inputFrom;
        inputFrom = tmpInputTo;
      }
    } else {
      tokenFrom = "XTZ";
      tokenTo = "tzBTC";
      // switches the values
      if (inputFrom && inputTo) {
        const tmpInputTo = inputTo;
        inputTo = inputFrom;
        inputFrom = tmpInputTo;
      }
    }
  };

  const saveInput = ev => {
    const { token, val } = ev.detail;
    if (token === tokenFrom && val > 0) {
      inputFrom = val.toString();
      inputTo = "";
      if (tokenFrom === "XTZ") {
        let tzbtcAmount = xtzToTokenTokenOutput({
          xtzIn: val * 10 ** 6,
          xtzPool: $store.dexInfo.xtzPool,
          tokenPool: $store.dexInfo.tokenPool
        });
        if (tzbtcAmount) {
          inputTo = tzbtcAmount.dividedBy(10 ** 8).toPrecision(6);
        }
      } else if (tokenFrom === "tzBTC") {
        let xtzAmount = tokenToXtzXtzOutput({
          tokenIn: val * 10 ** 8,
          xtzPool: $store.dexInfo.xtzPool,
          tokenPool: $store.dexInfo.tokenPool
        });
        if (xtzAmount) {
          inputTo = xtzAmount.dividedBy(10 ** 6).toPrecision(8);
        }
      }
    } else {
      inputFrom = "";
      inputTo = "";
    }
  };

  onMount(() => {
    let tzbtcAmount = xtzToTokenTokenOutput({
      xtzIn: 10 ** 6,
      xtzPool: $store.dexInfo.xtzPool,
      tokenPool: $store.dexInfo.tokenPool
    });
    if (tzbtcAmount) {
      xtzToTzbtc = tzbtcAmount.toNumber();
    }

    let xtzAmount = tokenToXtzXtzOutput({
      tokenIn: 10 ** 8,
      xtzPool: $store.dexInfo.xtzPool,
      tokenPool: $store.dexInfo.tokenPool
    });
    if (xtzAmount) {
      tzbtcToXtz = xtzAmount.toNumber();
    }
  });
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
  <div>
    {#if tokenFrom === "XTZ"}
      Price rate: 1 XTZ = {displayTokenAmount(xtzToTzbtc, "tzBTC")} tzBTC
    {:else}
      Price rate: 1 tzBTC = {displayTokenAmount(tzbtcToXtz, "XTZ")} XTZ
    {/if}
  </div>
  <button class="primary" disabled={!inputFrom || !inputTo}>Swap</button>
</div>
