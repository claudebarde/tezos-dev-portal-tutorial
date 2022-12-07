Now, let's talk about the wallet.

The wallet is a key element of your dapp, without it, the users won't be able to interact with the Tezos blockchain, which defeats your purpose. There are multiple considerations to take into account when you are setting up the wallet that we will explain below.

First, we want to isolate the wallet and its different interactions and values in the same component, called `Wallet.svelte` in our example. When using the Beacon SDK, it is crucial to keep a single instance of Beacon running in order to prevent bugs.

When the Wallet component mounts, there are different things we want to do:

```typescript=
onMount(async () => {
    const wallet = new BeaconWallet({
      name: "Tezos dev portal dapp tutorial",
      preferredNetwork: network
    });
    store.updateWallet(wallet);
    const activeAccount = await wallet.client.getActiveAccount();
    if (activeAccount) {
      const userAddress = (await wallet.getPKH()) as TezosAccountAddress;
      store.updateUserAddress(userAddress);
      $store.Tezos.setWalletProvider(wallet);
      await getWalletInfo(wallet);
      // fetches user's XTZ, tzBTC and SIRS balances
      const res = await fetchBalances($store.Tezos, userAddress);
      if (res) {
        store.updateUserBalance("XTZ", res.xtzBalance);
        store.updateUserBalance("tzBTC", res.tzbtcBalance);
        store.updateUserBalance("SIRS", res.sirsBalance);
      } else {
        store.updateUserBalance("XTZ", null);
        store.updateUserBalance("tzBTC", null);
        store.updateUserBalance("SIRS", null);
      }
    }
  });
```

We create the instance of the `BeaconWallet` by providing a name for the dapp (it can be whatever you want) that will be displayed in the wallet UI and the network you want to connect to (imported from the config file). The instance of the wallet is then saved into the store.

Now, we want to check if the user connected a wallet before. Beacon will keep track of live connections in the local storage, this is how your users can navigate to your dapp and have their wallet connected automagically!

The `BeaconWallet` instance provide a `client` property with different methods, the one we need here is `getActiveAccount()`, which will retrieve any live connection stored in the local storage.
If there is a live connection, we can fetch the user's address and save it into the store, update the store with the user's address before setting up the wallet as the signer with `$store.Tezos.setWalletProvider(wallet)`, get the information we need about the wallet (mainly, the name of the wallet) with the `getWalletInfo()` function and then, fetch the balances for the address that is connected with the `fetchBalances()` function described earlier.
Once the balances are fetched, they are saved into the store to be displayed in the interface.

### Connecting the wallet

Taquito and Beacon working in unison makes it very easy to connect the wallet. A few lines of code abstracted by this two essential libraries on Tezos are going to make miracles.

Here is how to do it:

```typescript=
const connectWallet = async () => {
    if (!$store.wallet) {
      const wallet = new BeaconWallet({
        name: "Tezos dev portal dapp tutorial",
        preferredNetwork: network
      });
      store.updateWallet(wallet);
    }

    await $store.wallet.requestPermissions({
      network: { type: network, rpcUrl }
    });
    const userAddress = (await $store.wallet.getPKH()) as TezosAccountAddress;
    store.updateUserAddress(userAddress);
    $store.Tezos.setWalletProvider($store.wallet);
    // finds account info
    await getWalletInfo($store.wallet);
    // fetches user's XTZ, tzBTC and SIRS balances
    const res = await fetchBalances($store.Tezos, userAddress);
    if (res) {
      store.updateUserBalance("XTZ", res.xtzBalance);
      store.updateUserBalance("tzBTC", res.tzbtcBalance);
      store.updateUserBalance("SIRS", res.sirsBalance);
    } else {
      store.updateUserBalance("XTZ", null);
      store.updateUserBalance("tzBTC", null);
      store.updateUserBalance("SIRS", null);
    }
  };
```