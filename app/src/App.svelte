<script lang="ts">
  import { onMount } from "svelte";
  import { TezosToolkit } from "@taquito/taquito";
  import { BeaconWallet } from "@taquito/beacon-wallet";
  import { NetworkType } from "@airgap/beacon-sdk";
  import store, { type TezosAccountAddress } from "./store";
  import { rpcUrl, dexAddress } from "./config";
  import Sidebar from "./lib/Sidebar.svelte";
  import Interface from "./lib/Interface.svelte";

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
    const storage: any = await contract.storage();

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
  });
</script>

<style lang="scss">
  @import "./styles/settings.scss";

  main {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: $padding;
    padding: $padding;
    height: calc(100% - (#{$padding} * 2));
  }
</style>

<main>
  <Sidebar />
  <Interface />
</main>
