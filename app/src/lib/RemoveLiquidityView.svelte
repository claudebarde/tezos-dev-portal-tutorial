<script lang="ts">
  import store from "../store";
  import UserInput from "./UserInput.svelte";
  import { removeLiquidityXtzTzbtcOut } from "../lbUtils";
  import { TxStatus } from "../types";
  import { calcDeadline } from "../utils";
  import { dexAddress } from "../config";

  let inputSirs = "";
  let xtzOutput = 0;
  let tzbtcOutput = 0;
  let resetInput = false;
  let removeLiquidityStatus = TxStatus.NoTransaction;

  const saveInput = ev => {
    const { token, val } = ev.detail;
    if (token === "SIRS" && val > 0) {
      inputSirs = val.toString();
      const outputRes = removeLiquidityXtzTzbtcOut({
        liquidityBurned: val,
        totalLiquidity: $store.dexInfo.lqtTotal.toNumber(),
        xtzPool: $store.dexInfo.xtzPool.toNumber(),
        tokenPool: $store.dexInfo.tokenPool.toNumber()
      });
      if (outputRes) {
        const { xtzOut, tzbtcOut } = outputRes;
        xtzOutput = xtzOut
          .dividedBy(10 ** 6)
          .decimalPlaces(6)
          .toNumber();
        tzbtcOutput = tzbtcOut
          .dividedBy(10 ** 8)
          .decimalPlaces(8)
          .toNumber();
      } else {
        xtzOutput = 0;
        tzbtcOutput = 0;
      }
    } else {
      inputSirs = "";
      xtzOutput = 0;
      tzbtcOutput = 0;
    }
  };

  const removeLiquidity = async () => {
    try {
      if (inputSirs) {
        removeLiquidityStatus = TxStatus.Loading;

        const lbContract = await $store.Tezos.wallet.at(dexAddress);
        const deadline = calcDeadline();
        const op = await lbContract.methodsObject
          .removeLiquidity({
            to: $store.userAddress,
            lqtBurned: inputSirs,
            minXtzWithdrawn: xtzOutput,
            minTokensWithdrawn: tzbtcOutput,
            deadline
          })
          .send();
        await op.confirmation();

        removeLiquidityStatus = TxStatus.Success;
      } else {
        throw "Missing value for SIRS";
      }
    } catch (error) {
      console.error(error);
      removeLiquidityStatus = TxStatus.Error;
    } finally {
      setTimeout(() => {
        removeLiquidityStatus = TxStatus.NoTransaction;
      }, 3000);
    }
  };
</script>

<style lang="scss">
  @import "../styles/settings.scss";

  .remove-liquidity-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    border: solid 3px darken($powder-blue, 10);
    border-radius: $std-border-radius;
    padding: calc(#{$padding} * 3);

    .remove-liquidity-inputs {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
    }

    .remove-liquidity-outputs {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;

      img {
        height: 28px;
        width: 28px;
      }

      & > div {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
      }
    }
  }
</style>

<div class="container remove-liquidity-container">
  <h1>Remove liquidity</h1>
  <div class="remove-liquidity-inputs">
    <UserInput
      token="SIRS"
      inputVal={inputSirs}
      logoPos="left"
      on:new-input={saveInput}
      disabled={false}
      reset={resetInput}
    />
  </div>
  <img src="images/arrow-down.svg" alt="arrow-down" />
  <div class="remove-liquidity-outputs">
    <div>
      <img src="images/XTZ.png" alt="XTZ" />
      <span>{xtzOutput} XTZ</span>
    </div>
    <span>/</span>
    <div>
      <img src="images/tzBTC.png" alt="tzBTC" />
      <span>{tzbtcOutput} tzBTC</span>
    </div>
  </div>
  <button class="primary" disabled={!inputSirs} on:click={removeLiquidity}>
    Remove liquidity
  </button>
</div>