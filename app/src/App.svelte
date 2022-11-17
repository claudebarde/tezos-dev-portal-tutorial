<script lang="ts">
  import { onMount } from "svelte";
  import { TezosToolkit } from "@taquito/taquito";
  import store from "./store";
  import { rpcUrl, dexAddress } from "./config";
  import Sidebar from "./lib/Sidebar.svelte";
  import Interface from "./lib/Interface.svelte";
  import type { Storage } from "./types";

  onMount(async () => {
    const Tezos = new TezosToolkit(rpcUrl);
    store.updateTezos(Tezos);
    const contract = await Tezos.wallet.at(dexAddress);
    const storage: Storage | undefined = await contract.storage();

    if (storage) {
      store.updateDexInfo({ ...storage });
    }

    // fetches XTZ and tzBTC prices
    const query = `
      query {
        overview { xtzUsdQuote },
        token(id: "KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn") { price }
      }
    `;
    const res = await fetch(`https://analytics-api.quipuswap.com/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query
      })
    });
    if (res.status === 200) {
      const resData = await res.json();
      let xtzPrice = resData?.data?.overview?.xtzUsdQuote;
      let tzbtcPrice = resData?.data?.token?.price;
      // validates the 2 values
      if (xtzPrice && tzbtcPrice) {
        xtzPrice = +xtzPrice;
        tzbtcPrice = +tzbtcPrice;
        if (!isNaN(xtzPrice) && !isNaN(tzbtcPrice)) {
          // tzBTC price is given in XTZ by the API
          tzbtcPrice = tzbtcPrice * xtzPrice;
          store.updateExchangeRates([
            { token: "XTZ", exchangeRate: xtzPrice },
            { token: "tzBTC", exchangeRate: tzbtcPrice }
          ]);
        }
      }
    }
  });
</script>

<style lang="scss">
  @import "./styles/settings.scss";

  main {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: $padding;
    padding: $padding;
    height: calc(100% - (#{$padding} * 3));
  }
</style>

<main>
  {#if $store.Tezos && $store.dexInfo}
    <Sidebar />
    <Interface />
  {:else}
    <div>Loading</div>
  {/if}
</main>
