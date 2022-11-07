<script lang="ts">
  import { onMount } from "svelte";
  import { BeaconWallet } from "@taquito/beacon-wallet";
  import { NetworkType } from "@airgap/beacon-sdk";
  import store, { type TezosAccountAddress } from "../store";
  import { rpcUrl } from "../config";
  import { shortenHash, displayTokenAmount } from "../utils";

  let connectedNetwork = "";

  const connectWallet = async () => {
    if (!$store.wallet) {
      const wallet = new BeaconWallet({
        name: "Tezos dev portal dapp tutorial",
        preferredNetwork: NetworkType.GHOSTNET
      });
      store.updateWallet(wallet);
    }

    await $store.wallet.requestPermissions({
      network: { type: NetworkType.GHOSTNET, rpcUrl }
    });
    const userAddress = await $store.wallet.getPKH();
    store.updateUserAddress(userAddress as TezosAccountAddress);
    $store.Tezos.setWalletProvider($store.wallet);
    // fetches user's balance
    const balance = await $store.Tezos.tz.getBalance(userAddress);
    store.updateUserBalance("XTZ", balance ? balance.toNumber() : undefined);
  };

  const disconnectWallet = async () => {
    $store.wallet.client.clearActiveAccount();
    store.updateWallet(undefined);
    store.updateUserAddress(undefined);
  };

  onMount(async () => {
    const wallet = new BeaconWallet({
      name: "Tezos dev portal dapp tutorial",
      preferredNetwork: NetworkType.GHOSTNET
    });
    store.updateWallet(wallet);
    const activeAccount = await wallet.client.getActiveAccount();
    if (activeAccount) {
      const userAddress = await wallet.getPKH();
      store.updateUserAddress(userAddress as TezosAccountAddress);
      $store.Tezos.setWalletProvider(wallet);
      // fetches user's balance
      const balance = await $store.Tezos.tz.getBalance(userAddress);
      store.updateUserBalance("XTZ", balance ? balance.toNumber() : undefined);
      // finds account info
      const walletInfo = await wallet.client.getActiveAccount();
      if (walletInfo?.network?.type) {
        connectedNetwork = walletInfo.network.type;
      } else {
        connectedNetwork = "";
      }
    }
  });
</script>

<style lang="scss">
  .wallet {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;

    .wallet__info {
      padding-bottom: 20px;
      text-align: center;

      p {
        margin: 0px;
        padding: 5px;
      }
    }
  }
</style>

<div class="wallet">
  {#if $store.wallet && $store.userAddress}
    <div class="wallet__info">
      <p>{shortenHash($store.userAddress)}</p>
      <p>
        {#if $store.userBalances.XTZ}
          {displayTokenAmount($store.userBalances.XTZ, "XTZ")} XTZ
        {:else}
          No balance
        {/if}
      </p>
      <p>
        {#if connectedNetwork}
          On {connectedNetwork}
        {:else}
          No network data
        {/if}
      </p>
    </div>
    <button class="wallet-button" on:click={disconnectWallet}>
      Disconnect
    </button>
  {:else}
    <button class="wallet-button" on:click={connectWallet}>
      Connect wallet
    </button>
  {/if}
</div>
