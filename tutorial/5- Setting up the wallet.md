Now, let's talk about the wallet.

The wallet is a key element of your dapp, without it, the users won't be able to interact with the Tezos blockchain, which defeats your purpose. There are multiple considerations to take into account when you are setting up the wallet that we will explain below.

First, we want to isolate the wallet and its different interactions and values in the same component, called `Wallet.svelte` in our example. When using the Beacon SDK, it is crucial to keep a **single instance of Beacon** running in order to prevent bugs.

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

We create the instance of the `BeaconWallet` by providing a name for the dapp (it can be whatever you want) that will be displayed in the wallet UI and the network you want to connect to (imported from the config file). The instance of the wallet is then saved in the store.

Now, we want to check if the user connected a wallet before. Beacon will keep track of live connections in the local storage, this is how your users can navigate to your dapp and have their wallet connected automagically!

The `BeaconWallet` instance provides a `client` property with different methods, the one we need here is `getActiveAccount()`, which will retrieve any live connection stored in the local storage.
If there is a live connection, we can fetch the user's address and save it into the store, update the store with the user's address before setting up the wallet as the signer with `$store.Tezos.setWalletProvider(wallet)`, get the information we need about the wallet (mainly, the name of the wallet) with the `getWalletInfo()` function and then, fetch the balances for the address that is connected with the `fetchBalances()` function described earlier.
Once the balances are fetched, they are saved into the store to be displayed in the interface.

>*Note: `TezosAccountAddress` is a custom type I like to use to validate Tezos addresses for implicit accounts:
>`type TezosAccountAddress = tz${"1" | "2" | "3"}${string}`
>TypeScript will raise a warning if you try to use a string that doesn't match this pattern.

### Connecting the wallet

Taquito and Beacon working in unison makes it very easy to connect the wallet. A few lines of code using the APIs of these two essential libraries on Tezos are going to make miracles.

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

The connection will be handled in a specific function called `connectWallet`.
If the store doesn't hold an instance of the `BeaconWallet` (if the dapp didn't detect any live connection on mount), we create that instance and save it in the store.

Next, we ask the user to select a wallet with the `requestPermissions()` method present on the instance of the `BeaconWallet`. The parameter is an object where we indicate the network we want to connect to as well as the URL of the Tezos RPC node we will interact with.

After the user selects a wallet to use with our dapp, we get their address with the `getPKH()` method on the `BeaconWallet` instance, we update the signer in the `TezosToolkit` instance by passing the wallet instance to `setWalletProvider()`, we get the information we need from the wallet and we fetch the user's balances.

Now, the wallet is connected and the user is shown their different balances, as well as a connection status in the sidebar!

> IMPORTANT: however you want to design your dapp, it is essential to keep one single instance of the `BeaconWallet` and it is highly recommended to do the same with the instance of the `TezosToolkit`. Creating multiple instances messes with the state of your app and with Taquito in general.

### Disconnecting the wallet

Disconnecting the wallet is as important as connecting it. There is nothing more frustrating than looking for how to disconnect your wallet for hours when it is not made explicit. Remember, a lot of users have multiple wallets (like Temple or Kukai) and even multiple addresses within the same wallet that they want to use to interact with your dapp. Make disconnecting the wallet easy for them.

```typescript=
const disconnectWallet = async () => {
    $store.wallet.client.clearActiveAccount();
    store.updateWallet(undefined);
    store.updateUserAddress(undefined);
    connectedNetwork = "";
    walletIcon = "";
  };
```

There are different steps to disconnect the wallet and reset the state of the dapp:
- `$store.wallet.client.clearActiveAccount()` -> kills the current connection to Beacon
- `store.updateWallet(undefined)` -> removes the wallet from the state in order to trigger a reload of the interface
- `store.updateUserAddress(undefined)` -> removes the current user's address from the state to update the UI
- `connectedNetwork = ""; walletIcon = ""` -> also needed to reset the state of the dapp and present an interface where no wallet is connected

The call to `clearActiveAccount()` on the wallet instance is the only thing that you will do in whatever dapp you are building, it will remove all the data in the local storage and when your user will revisit your dapp, they won't be automatically connected with their wallet.

### Design considerations

Writing code to interact with a wallet in a decentralized application is a very new paradigm and although you will be able to reuse a lot of concepts and good practices from your experience as a developer, there are also a few new things to keep in mind:

1. Never prompt the users to connect their wallet after the dapp is mounted: getting a wallet popup on your screen just after the app is loaded is annoying, you have to remember that a lot of your users are non-technical and don't understand that connecting a wallet is harmless, so they may be wary about your dapp if you ask them to connect their wallet from the get-go. Instead, present some information about your dapp and a button to manually connect their wallet, if this is their first time.
2. The button to connect a wallet must stand out in your interface, whether you make it bigger, with a different color, or a different font, the users must not spend more than a couple of seconds to find it.
3. The button must be in a predictable position: most dapps on Tezos place their button to connect a wallet at the top-left or top-right of the UI. You are not *"creative"* by placing the button in some other location, you will just end up confusing your users.
4. The text in the button should read **Connect** or something similar, avoid **Sync** or other words but "connect" as they can mean something different in the context of a decentralized application.
5. The status of the wallet must be displayed in the dapp. Whether it is connected or disconnected, the user should be able to tell. Additionally, you can add some information about the wallet they are using (like we do in this tutorial), the network they are connected to, or their balance.
6. You must enable/disable the interactions of your dapp that depend on the wallet. Users shouldn't be able to interact with a feature of your application that requires their wallet to be connected if this is not the case.