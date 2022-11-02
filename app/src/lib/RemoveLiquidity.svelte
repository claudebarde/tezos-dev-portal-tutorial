<script lang="ts">
  import UserInput from "./UserInput.svelte";

  let inputSirs = "";
  let xtzOutput = 0;
  let tzbtcOutput = 0;

  const saveInput = ev => {
    const { token, val } = ev.detail;
    if (token === "SIRS" && val > 0) {
      inputSirs = val.toString();
      xtzOutput = 69;
      tzbtcOutput = 6969;
    } else {
      inputSirs = "";
      xtzOutput = 0;
      tzbtcOutput = 0;
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
  <button class="primary" disabled={!inputSirs}> Remove liquidity </button>
</div>
