<script lang="ts">
  import { afterUpdate, createEventDispatcher } from "svelte";
  import type { token } from "../types";

  let currentToken: token;
  let inputVal = "";
  const dispatch = createEventDispatcher();

  export let logoPos: "left" | "right", token: token, disabled: boolean;

  const inputAmount = ev => {
    const val = ev.target.value;
    // validates numeric input
    if (!isNaN(+val)) {
      inputVal = val;
      dispatch("new-input", { token, val });
    } else {
      inputVal = "";
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
    <button class="input-with-logo__max transparent">Max: 69</button>
  </div>
{/if}
