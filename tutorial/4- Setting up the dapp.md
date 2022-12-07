If you've made it so far and your app is running on `http://localhost:4000`, congratulations!

Now, we have to set up the dapp in order to use Taquito and Beacon.

### File structure

The entrypoint of every Svelte app is a file called `App.svelte`, this is where you will import all your components to be bundled together into your final app. The file structure of our project looks like this:

```
- src
	- assets
		- svelte.png
	- lib
		- AddLiquidityView.svelte
		- Interface.svelte
		- RemoveLiquidity.svelte
		- Sidebar.svelte
		- SirsStats.svelte
		- SwapView.svelte
		- Toast.svelte
		- UserInput.svelte
		- UserStats.svelte
		- Wallet.svelte
	- styles
		- index.scss
		- settings.scss
	- App.svelte
	- config.ts
	- lbUtils.ts
	- main.ts
	- store.ts
	- types.ts
	- utils.ts
- index.html
- svelte.config.js
- tsconfig.json
- vite.config.js
```

Let's see what each of these elements do:
- **assets** -> contains the favicon (this is the default Svelte favicon, but you can choose another one)
- **lib** -> contains the different components that will make up our interface, here is what each does:
	- `AddLiquidityView.svelte`: the interface to add liquidity to the LB DEX
	- `Interface.svelte`: the higher-order component to hold the different views to interact with the LB DEX
	- `RemoveLiquidity.svelte`: the interface to remove liquidity from the LB DEX
	- `Sidebar.svelte`: the component to navigate between the different interface and to connect or disconnect the wallet
	- `SirsStats.svelte`: the component to display the amount of XTZ, tzBTC and SIRS present in the contract
	- `SwapView.svelte`: the interface to swap XTZ and tzBTC tokens
	- `Toast.svelte`: a simple component to display the progression of the transactions and other messages when interacting with the contract
	- `UserInput.svelte`: a utility component to make it easier to interact and control input fields
	- `UserStats.svelte`: the component to display the user's balance in XTZ, tzBTC and SIRS
	- `Wallet.svelte`: the component to manage wallet interactions
- **styles** -> contains the SASS files to style different elements of our interface
- **App.svelte** -> the entrypoint of the application
- **config.ts** -> different immutable values needed for the application and saved in a separate file for convenience
- **lbUtils.ts** -> different methods to calculate values needed to interact with the Liquidity Baking contract
- **main.ts** -> this is where the JavaScript for the app is bundled before being injected into the HTML file
- **store.ts** -> a file with a store to handle the dapp state
- **types.ts** -> custom TypeScript types 
- **utils.ts** -> different utility methods

The first thing to do is to import our styles into the `main.ts` file:

```typescript=
import App from './App.svelte'
import "./styles/index.scss";  

const app = new App({
	target: document.body
})  

export default app
```

Svelte uses SASS by default, so there is no configuration to do for that.

> *Note: I also like to target the `body` tag to inject the HTML produced by JavaScript instead of a `div` inside the `body`, but that's a personal choice and you are free to use a `div` instead*

Before continuing, this is how a Svelte file looks like:

```html=
<script lang="ts">
	... your TypeScript code
</script>

<style lang="scss">
	... your SASS code
</style>

... your HTML code
```

Svelte components are fully contained, which means that the style that you apply inside a component doesn't leak to the other components of your app. The style that we want to share among different component will be written in the `index.scss` file.

There is a `script` tag with a `lang` attribute set to `ts` for TypeScript, a `style` tag with a `lang` attribute set to `scss` for SASS and the rest of the code in the file will be interpreted as HTML.

### Configuring the dapp
 
Now, let's set up different things in our `App.svelte` file.

The HTML part is just going to put all the higher-order component together
```html=
<main>
	<Toast />
	{#if $store.Tezos && $store.dexInfo}
		<Sidebar />
		<Interface />
	{:else}
		<div>Loading</div>
	{/if}
</main>
```
The interface will change after different elements are available to the dapp, mostly, the data about the liquidity pools from the liquidity baking contract

The SASS part will import different settings and apply styling to the `main` tag
```scss=
@import "./styles/settings.scss";

main {
	display: grid;
	grid-template-columns: 250px 1fr;
	gap: $padding;
	padding: $padding;
	height: calc(100% - (#{$padding} * 2));
}

@media screen and (max-height: 700px) {
	main {
	padding: 0px;
	height: 100%;
	}
}
```

Now, the TypeScript part.
First, we import the libraries and components we need
```typescript=
import { onMount } from "svelte";
import { TezosToolkit } from "@taquito/taquito";
import store from "./store";
import { rpcUrl, dexAddress } from "./config";
import Sidebar from "./lib/Sidebar.svelte";
import Interface from "./lib/Interface.svelte";
import Toast from "./lib/Toast.svelte";
import type { Storage } from "./types";
import { fetchExchangeRates } from "./utils";
```
- `onMount` is a method exported by Svelte that will run some code when the component mounts (more on that below)
- `TezosToolkit` is the class that gives you access to all the features of Taquito
- `store` is a Svelte feature to manage the state of the dapp
- From the `config.ts` file, we import `rpcUrl` (the URL of the Tezos RPC node) and `dexAddress`, the address of the Liquidity Baking contract
- `Storage` is a custom type that represents the storage type of the LB DEX
- `fetchExchangeRates` is a function to fetch the exchange rates of XTZ and tzBTC (more on that below)

Next, we use `onMount` to set up the state of the dapp:
```typescript=
onMount(async () => {
    const Tezos = new TezosToolkit(rpcUrl);
    store.updateTezos(Tezos);
    const contract = await Tezos.wallet.at(dexAddress);
    const storage: Storage | undefined = await contract.storage();

    if (storage) {
      store.updateDexInfo({ ...storage });
    }

    // fetches XTZ and tzBTC prices
    const res = await fetchExchangeRates();
    if (res) {
      store.updateExchangeRates([
        { token: "XTZ", exchangeRate: res.xtzPrice },
        { token: "tzBTC", exchangeRate: res.tzbtcPrice }
      ]);
    } else {
      store.updateExchangeRates([
        { token: "XTZ", exchangeRate: null },
        { token: "tzBTC", exchangeRate: null }
      ]);
    }
  });
```

The first thing to do is to create an instance of the `TezosToolkit` by passing the URL of the RPC node we want to interact with. In general, you want to have a single instance of the `TezosToolkit` in order to keep the same configuration across all your app components, this is why we save it in the `store` with the `updateTezos` method.

After that, we want to fetch the storage of the LB DEX in order to get the amounts of XTZ, tzBTC and SIRS in the contract. We create a `ContractAbstraction`, an instance provided by Taquito with different properties and methods that are useful to work with Tezos smart contracts.
From the `COntractAbstraction`, we can call the `storage` method that returns a JavaScript object that represents the storage of the given contract. We then pass the storage to the `updateDexInfo` method present on the `store` to update this data and display them to the user.

To finish, we need to fetch the exchange rates for XTZ and tzBTC in order to make conversions required by this kind of app. The `utils.ts` file contains a function that will help us here:

```typescript=
export const fetchExchangeRates = async (): Promise<{
  tzbtcPrice: number;
  xtzPrice: number;
} | null> => {
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
        return { tzbtcPrice, xtzPrice };
      }
    } else {
      return null;
    }
  } else {
    return null;
  }
};
```

We use the [QuipuSwap GraphQL API](https://analytics-api.quipuswap.com/graphql) to fetch these exchange rates. After the exchange rates are received, we parse the response from the API and validate the price given for XTZ and tzBTC. These prices are then returned by the function and we can save them in the store.