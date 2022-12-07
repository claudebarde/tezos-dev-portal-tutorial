If you've made it so far and your app is running on `http://localhost:4000`, congratulations!

Now, we have to set up the dapp in order to use Taquito and Beacon.

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
- **store.ts** -> a file with a store to handle the dapp context
- **types.ts** -> custom TypeScript types 
- **utils.ts** -> different utility methods

