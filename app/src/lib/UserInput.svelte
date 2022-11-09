<script lang="ts">
  import { afterUpdate, createEventDispatcher } from "svelte";
  import type { token } from "../types";
  import store from "../store";
  import { displayTokenAmount } from "../utils";

  let currentToken: token;
  const dispatch = createEventDispatcher();

  export let inputVal: string,
    logoPos: "left" | "right",
    token: token,
    disabled: boolean;

  const inputAmount = ev => {
    const val = +ev.target.value;
    // validates numeric input
    if (!isNaN(val)) {
      dispatch("new-input", { token, val });
    } else {
      dispatch("new-input", { token, val: null });
    }
  };

  afterUpdate(() => {
    // validates the token
    if (["XTZ", "tzBTC", "SIRS"].includes(token)) {
      currentToken = token;
    } else {
      currentToken = undefined;
    }
  });
</script>

{#if currentToken}
  <div
    class={`input-with-logo ${logoPos === "left" ? "left-logo" : "right-logo"}`}
  >
    <div class="input-with-logo__input">
      {#if logoPos === "left"}
        <img src={`images/${token}.png`} alt={token} />
      {/if}
      <input type="text" value={inputVal} on:input={inputAmount} {disabled} />
      {#if logoPos === "right"}
        <img src={`images/${token}.png`} alt={token} />
      {/if}
    </div>
    <button class="input-with-logo__max transparent">
      {#if $store.userAddress}
        Max: {$store.userBalances[currentToken]
          ? displayTokenAmount($store.userBalances[currentToken], currentToken)
          : 0}
      {:else}
        No balance
      {/if}
    </button>
  </div>
{/if}
