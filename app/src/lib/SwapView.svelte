<script lang="ts">
  import { onMount } from "svelte";
  import { OpKind } from "@taquito/taquito";
  import UserInput from "./UserInput.svelte";
  import { type token, TxStatus } from "../types";
  import {
    xtzToTokenTokenOutput,
    tokenToXtzXtzOutput,
    calcSlippageValue
  } from "../lbUtils";
  import store from "../store";
  import { displayTokenAmount, fetchBalances, calcDeadline } from "../utils";
  import { dexAddress, tzbtcAddress, XTZ, tzBTC } from "../config";

  let tokenFrom: token = "XTZ";
  let tokenTo: token = "tzBTC";
  let inputFrom = "";
  let inputTo = "";
  let xtzToTzbtc = 0;
  let tzbtcToXtz = 0;
  let slippage: "0.1" | "0.5" | "1" = "0.1";
  let insufficientBalance = false;
  let resetInputs = false;
  let swapStatus = TxStatus.NoTransaction;

  //TODO: add slippage selection

  const switchTokens = () => {
    resetInputs = true;
    setTimeout(() => (resetInputs = false), 100);

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
    const { token, val, insufficientBalance: insufBlnc } = ev.detail;
    insufficientBalance = insufBlnc;

    if (token === tokenFrom && val > 0) {
      inputFrom = val.toString();
      inputTo = "";
      if (tokenFrom === "XTZ") {
        // calculates tzBTC amount
        let tzbtcAmount = xtzToTokenTokenOutput({
          xtzIn: val * 10 ** XTZ.decimals,
          xtzPool: $store.dexInfo.xtzPool,
          tokenPool: $store.dexInfo.tokenPool
        });
        if (tzbtcAmount) {
          inputTo = tzbtcAmount.dividedBy(10 ** tzBTC.decimals).toPrecision(6);
        }
      } else if (tokenFrom === "tzBTC") {
        // calculates XTZ amount
        let xtzAmount = tokenToXtzXtzOutput({
          tokenIn: val * 10 ** tzBTC.decimals,
          xtzPool: $store.dexInfo.xtzPool,
          tokenPool: $store.dexInfo.tokenPool
        });
        if (xtzAmount) {
          inputTo = xtzAmount.dividedBy(10 ** XTZ.decimals).toPrecision(8);
        }
      }
    } else {
      inputFrom = "";
      inputTo = "";
    }
  };

  const swap = async () => {
    try {
      if (isNaN(+inputFrom) || isNaN(+inputTo)) {
        return;
      }
      swapStatus = TxStatus.Loading;
      const lbContract = await $store.Tezos.wallet.at(dexAddress);
      const deadline = calcDeadline();
      if (tokenFrom === "XTZ") {
        // selling tzbtc for xtz => tokenToXTZ
        const tzBtcContract = await $store.Tezos.wallet.at(tzbtcAddress);
        const tokensSold = Math.floor(+inputTo * 10 ** tzBTC.decimals);
        const minXtzBought = calcSlippageValue("XTZ", +inputFrom, 0.1);
        let batch = $store.Tezos.wallet
          .batch()
          .withContractCall(tzBtcContract.methods.approve(dexAddress, 0))
          .withContractCall(
            tzBtcContract.methods.approve(dexAddress, tokensSold)
          )
          .withContractCall(
            lbContract.methods.tokenToXtz(
              $store.userAddress,
              tokensSold,
              minXtzBought,
              deadline
            )
          );
        const batchOp = await batch.send();
        await batchOp.confirmation();
      } else {
        // selling xtz for tzbtc => xtzToToken
        const minTokensBought = calcSlippageValue("tzBTC", +inputFrom, 0.1);
        let batch = $store.Tezos.wallet.batch([
          {
            kind: OpKind.TRANSACTION,
            ...lbContract.methods
              .xtzToToken($store.userAddress, minTokensBought, deadline)
              .toTransferParams(),
            amount: +inputTo * 10 ** XTZ.decimals,
            mutez: true
          }
        ]);

        const batchOp = await batch.send();
        await batchOp.confirmation();
        /*const op = await lbContract.methods
          .xtzToToken($store.userAddress, minTokensBought, deadline)
          .send({ amount: +amountInXTZ * 10 ** 6, mutez: true });
        await op.confirmation();*/
      }
      inputFrom = "";
      inputTo = "";
      swapStatus = TxStatus.Success;
      // fetches new XTZ balance
      const xtzBalance = await $store.Tezos.tz.getBalance($store.userAddress);
      if (xtzBalance) {
        store.updateUserBalance("XTZ", xtzBalance.toNumber());
      } else {
        store.updateUserBalance("XTZ", null);
      }
      // fetches new tzBTC balance
      const res = await fetchBalances($store.userAddress);
      if (res) {
        store.updateUserBalance("tzBTC", res.tzbtcBalance);
        store.updateUserBalance("SIRS", res.sirsBalance);
      } else {
        store.updateUserBalance("tzBTC", null);
        store.updateUserBalance("SIRS", null);
      }
    } catch (error) {
      console.log(error);
      swapStatus = TxStatus.Error;
    } finally {
      setTimeout(() => {
        swapStatus = TxStatus.NoTransaction;
      }, 3000);
    }
  };

  onMount(() => {
    let tzbtcAmount = xtzToTokenTokenOutput({
      xtzIn: 10 ** XTZ.decimals,
      xtzPool: $store.dexInfo.xtzPool,
      tokenPool: $store.dexInfo.tokenPool
    });
    if (tzbtcAmount) {
      xtzToTzbtc = tzbtcAmount.toNumber();
    }

    let xtzAmount = tokenToXtzXtzOutput({
      tokenIn: 10 ** tzBTC.decimals,
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
      reset={resetInputs}
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
      reset={resetInputs}
    />
  </div>
  <div>
    Slippage:
    <span>
      <input type="radio" name="slippage" bind:group={slippage} value="0.1" />
      0.1%
    </span>
    <span>
      <input type="radio" name="slippage" bind:group={slippage} value="0.5" />
      0.5%
    </span>
    <span>
      <input type="radio" name="slippage" bind:group={slippage} value="1" />
      1%
    </span>
  </div>
  <div>
    {#if tokenFrom === "XTZ"}
      Price rate: 1 XTZ = {displayTokenAmount(xtzToTzbtc, "tzBTC")} tzBTC
    {:else}
      Price rate: 1 tzBTC = {displayTokenAmount(tzbtcToXtz, "XTZ")} XTZ
    {/if}
  </div>
  <button
    class="primary"
    disabled={!inputFrom ||
      !inputTo ||
      !$store.userAddress ||
      insufficientBalance ||
      swapStatus !== TxStatus.NoTransaction}
    on:click={swap}
  >
    Swap
  </button>
</div>
