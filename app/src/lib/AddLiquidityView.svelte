<script lang="ts">
  import store from "../store";
  import UserInput from "./UserInput.svelte";
  import { type token, TxStatus } from "../types";
  import {
    xtzToTokenTokenOutput,
    tokenToXtzXtzOutput,
    addLiquidityLiquidityCreated
  } from "../lbUtils";
  import { dexAddress, tzbtcAddress } from "../config";
  import { calcDeadline } from "../utils";

  let inputXtz = "";
  let inputTzbtc = "";
  let sirsOutput = 0;
  let addLiquidityStatus = TxStatus.NoTransaction;
  let resetXtzInput = false;
  let resetTzbtcInput = false;

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
        sirsOutput = Math.floor(liquidityCreated.toNumber());
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
          sirsOutput = Math.floor(liquidityCreated.toNumber());
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

  const addLiquidity = async () => {
    try {
      if (inputXtz && inputTzbtc && sirsOutput) {
        addLiquidityStatus = TxStatus.Loading;

        const lbContract = await $store.Tezos.wallet.at(dexAddress);
        const tzBtcContract = await $store.Tezos.wallet.at(tzbtcAddress);
        const deadline = calcDeadline();
        const batch = $store.Tezos.wallet
          .batch()
          .withContractCall(tzBtcContract.methods.approve(dexAddress, 0))
          .withContractCall(
            tzBtcContract.methods.approve(dexAddress, +inputTzbtc)
          )
          .withContractCall(
            lbContract.methodsObject.addLiquidity({
              owner: $store.userAddress,
              minLqtMinted: sirsOutput,
              maxTokensDeposited: inputTzbtc,
              deadline
            })
          );
        const batchOp = await batch.send();
        await batchOp.confirmation();

        addLiquidityStatus = TxStatus.Success;
      } else {
        throw "Missing value for XTZ, tzBTC or SIRS";
      }
    } catch (error) {
      console.error(error);
      addLiquidityStatus = TxStatus.Error;
    } finally {
      setTimeout(() => {
        addLiquidityStatus = TxStatus.NoTransaction;
      }, 3000);
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
      reset={resetXtzInput}
    />
    <UserInput
      token="tzBTC"
      inputVal={inputTzbtc}
      logoPos="right"
      on:new-input={saveInput}
      disabled={false}
      reset={resetTzbtcInput}
    />
  </div>
  <div class="add-liquidity-output">
    <img src="images/SIRS.png" alt="SIRS" />
    <span>{sirsOutput} SIRS</span>
  </div>
  <button
    class="primary"
    disabled={!inputXtz || !inputTzbtc}
    on:click={addLiquidity}
  >
    Add liquidity
  </button>
</div>
