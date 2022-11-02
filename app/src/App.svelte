<script lang="ts">
  import { onMount } from "svelte";
  import { TezosToolkit } from "@taquito/taquito";
  import { BeaconWallet } from "@taquito/beacon-wallet";
  import { NetworkType } from "@airgap/beacon-sdk";
  import store, { type TezosAccountAddress } from "./store";
  import { rpcUrl, dexAddress } from "./config";
  import Sidebar from "./lib/Sidebar.svelte";
  import Interface from "./lib/Interface.svelte";
  import type { Storage } from "./types";

  const connectWallet = async () => {
    await $store.wallet.requestPermissions({
      network: { type: NetworkType.GHOSTNET, rpcUrl }
    });
    const userAddress = await $store.wallet.getPKH();
    store.updateUserAddress(userAddress as TezosAccountAddress);
    $store.Tezos.setWalletProvider($store.wallet);
  };

  const disconnectWallet = async () => {
    $store.wallet.client.destroy();
    $store.wallet = undefined;
  };

  onMount(async () => {
    const Tezos = new TezosToolkit(rpcUrl);
    const contract = await Tezos.wallet.at(dexAddress);
    const storage: Storage | undefined = await contract.storage();

    if (storage) {
      store.updateDexInfo({ ...storage });
    }

    const wallet = new BeaconWallet({
      name: "Tezos dev portal dapp tutorial",
      preferredNetwork: NetworkType.GHOSTNET
    });
    const activeAccount = await wallet.client.getActiveAccount();
    if (activeAccount) {
      const userAddress = await wallet.getPKH();
      store.updateUserAddress(userAddress as TezosAccountAddress);
      Tezos.setWalletProvider(wallet);
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
          console.log(xtzPrice, tzbtcPrice);
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
  <Sidebar />
  <Interface />
</main>
