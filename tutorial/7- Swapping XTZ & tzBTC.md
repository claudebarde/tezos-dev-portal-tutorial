Now, let's go down the rabbit hole and implement the most complex feature of the dapp: the swap of XTZ and tzBTC.

I say "the most complex" because the interface we are about to build includes a lot of moving parts and calculations that must be done at the moment of the user's input and confirmation. The Liquidity Baking contract is also a bit picky about the data you must send in order to swap tokens, so we will have to fine tune our code to make sure that it goes like clockwork!

Here is a screenshot of the UI we are aiming for:

![Swap UI](/images/swap-ui.png "Swap UI")

There are 2 text inputs, the one on the left is editable and will let the user input the amount of XTZ or tzBTC they want to exchange and the one on the right will displaying the corresponding amount they'll get in the other token. The button in the middle with the 2 arrows will allow the user to switch the input between XTZ and tzBTC.

Going into the details of how the text inputs are implemented would go beyond the scope of this tutorial, but you can have a look at it in the `UserInput.svelte` file.

In a nutshell, each input with its token icon and `max` field is the same component, the parent component tracks the position of each to update their UI accordingly. Internally, each input component keeps track of the user's input and the available balance to display error messages if the balance is too low. Each update in the input is dispatched to the parent component to adjust the general UI.

Every time an update is sent to the parent component (`SwapView.svelte`), the data provided with the update is passed to the `saveInput` function:

```typescript=
import { 
	xtzToTokenTokenOutput, 
	tokenToXtzXtzOutput, 
	calcSlippageValue 
} from "../lbUtils";
  
const saveInput = ev => {
    const { token, val, insufficientBalance: insufBlnc } = ev.detail;
    insufficientBalance = insufBlnc;

    if (token === tokenFrom && val > 0) {
      inputFrom = val.toString();
      inputTo = "";
      if (tokenFrom === "XTZ") {
        // calculates tzBTC amount
        let tzbtcAmount = xtzToTokenTokenOutput({
          xtzIn: val * 10 ** XTZ.decimals,
          xtzPool: $store.dexInfo.xtzPool,
          tokenPool: $store.dexInfo.tokenPool
        });
        if (tzbtcAmount) {
          inputTo = tzbtcAmount.dividedBy(10 ** tzBTC.decimals).toPrecision(6);
        }
        // calculates minimum output
        minimumOutput = calcSlippageValue("tzBTC", +inputTo, +slippage);
      } else if (tokenFrom === "tzBTC") {
        // calculates XTZ amount
        let xtzAmount = tokenToXtzXtzOutput({
          tokenIn: val * 10 ** tzBTC.decimals,
          xtzPool: $store.dexInfo.xtzPool,
          tokenPool: $store.dexInfo.tokenPool
        });
        if (xtzAmount) {
          inputTo = xtzAmount.dividedBy(10 ** XTZ.decimals).toPrecision(8);
        }
        // calculates minimum output
        minimumOutput = calcSlippageValue("XTZ", +inputTo, +slippage);
      }
    } else {
      inputFrom = "";
      inputTo = "";
    }
  };
```

Here, a lot of things happen:
- the values necessary for the calculations of the token amounts are destructured from the `ev.detail` object
- the function verifies that the values are received from the token that is currently active (the one on the left)
- if that token is XTZ, the amount in tzBTC is calculated via the `xtzToTokenTokenOutput` function (more on that below)
- if that token is tzBTC, the amount in XTZ is calculated via the `tokenToXtzXtzOutput` function (more on that below)
- the minimum amount to be expected according to the slippage set by the user is calculated by the `calcSlippage` function

>*Note: the "slippage" refers to the percentage that the user accepts to lose during the trade, a loss of tokens can happen according to the state of the liquidity pools. For example, if 100 tokens A can be swapped for 100 tokens B with a slippage of 1%, it means that you will receive between 99 and 100 tokens B.*

Now, let's have a look at the functions we introduced above, `xtzToTokenTokenOutput` and `tokenToXtzXtzOutput`. They were adapted [from the code in this repo](https://github.com/kukai-wallet/kukai-dex-calculations) and allows you to calculate how many tzBTC a user will get according to the XTZ amount they input and vice-versa.

```typescript=
export const xtzToTokenTokenOutput = (p: {
  xtzIn: BigNumber | number;
  xtzPool: BigNumber | number;
  tokenPool: BigNumber | number;
}): BigNumber | null => {
  let { xtzIn, xtzPool: _xtzPool, tokenPool } = p;
  let xtzPool = creditSubsidy(_xtzPool);
  let xtzIn_ = new BigNumber(0);
  let xtzPool_ = new BigNumber(0);
  let tokenPool_ = new BigNumber(0);
  try {
    xtzIn_ = new BigNumber(xtzIn);
    xtzPool_ = new BigNumber(xtzPool);
    tokenPool_ = new BigNumber(tokenPool);
  } catch (err) {
    return null;
  }
  if (
    xtzIn_.isGreaterThan(0) &&
    xtzPool_.isGreaterThan(0) &&
    tokenPool_.isGreaterThan(0)
  ) {
    const numerator = xtzIn_.times(tokenPool_).times(new BigNumber(998001));
    const denominator = xtzPool_
      .times(new BigNumber(1000000))
      .plus(xtzIn_.times(new BigNumber(998001)));
    return numerator.dividedBy(denominator);
  } else {
    return null;
  }
};
```

The `xtzToTokenTokenOutput` function requires 3 values to calculate an amount in tzBtc from an amount in XTZ: the said amount in XTZ (`xtzIn`), the state of the XTZ pool in the contract (`xtzPool`) and the state of the SIRS pool (`tokenPool`). Most of the modifications made to the original functions apply to the use of `BigNumber` in order to make it work more smoothly with Taquito. The function then returns the corresponding amount in tzBTC or `null` if an error occurs.

The same goes for `tokenToXtzXtzOutput`:

```typescript=
export const tokenToXtzXtzOutput = (p: {
  tokenIn: BigNumber | number;
  xtzPool: BigNumber | number;
  tokenPool: BigNumber | number;
}): BigNumber | null => {
  const { tokenIn, xtzPool: _xtzPool, tokenPool } = p;
  let xtzPool = creditSubsidy(_xtzPool);
  let tokenIn_ = new BigNumber(0);
  let xtzPool_ = new BigNumber(0);
  let tokenPool_ = new BigNumber(0);
  try {
    tokenIn_ = new BigNumber(tokenIn);
    xtzPool_ = new BigNumber(xtzPool);
    tokenPool_ = new BigNumber(tokenPool);
  } catch (err) {
    return null;
  }
  if (
    tokenIn_.isGreaterThan(0) &&
    xtzPool_.isGreaterThan(0) &&
    tokenPool_.isGreaterThan(0)
  ) {
    let numerator = new BigNumber(tokenIn)
      .times(new BigNumber(xtzPool))
      .times(new BigNumber(998001));
    let denominator = new BigNumber(tokenPool)
      .times(new BigNumber(1000000))
      .plus(new BigNumber(tokenIn).times(new BigNumber(999000)));
    return numerator.dividedBy(denominator);
  } else {
    return null;
  }
};
```

After the corresponding amount of XTZ or tzBTC is calculated according to the inputs of the user, the UI unlocks and is ready for a swap.

Swapping the tokens is pretty intensive as they are multiple moving parts that must play in unison. Let's describe step by step what happens after the user clicks on the *Swap* button:

```typescript=
const swap = async () => {
    try {
      if (isNaN(+inputFrom) || isNaN(+inputTo)) {
        return;
      }

...

	 } catch (error) {
	      console.log(error);
	      swapStatus = TxStatus.Error;
	      store.updateToast(true, "An error has occurred");
	}
};
```

The `swap` function is triggered when the user clicks the *Swap* button. The first thing to do is to check if there is a valid value for `inputFrom`, i.e. the token that the user wants to exchange (XTZ or tzBTC) and a valid value for `inputTo`, i.e. the token that the user will receive. There is no point in going further if those two values are not set properly.

Next, we update the UI in order to show to the user that the transaction is getting ready:

```typescript=
enum TxStatus {
  NoTransaction,
  Loading,
  Success,
  Error
}

swapStatus = TxStatus.Loading;
store.updateToast(true, "Waiting to confirm the swap...");

const lbContract = await $store.Tezos.wallet.at(dexAddress);
const deadline = calcDeadline();
```

We create an [`enum`](https://www.typescriptlang.org/docs/handbook/enums.html) to represent the status of the transaction (available in the `type.ts` file) and we update the `swapStatus` variable responsible for updating the UI and blocking the inputs. The store is also updated with the `updateToast()` method in order to get a simple toast show up in the interface.

After that, we create the `ContractAbstraction` from Taquito in order to interact with the DEX and we also calculate the deadline.

>*Note: the Liquidity Baking contract expects you to pass a deadline for the swap, the transaction will be rejected if the deadline is not valid.*

Now, we have 2 situations: the user selected either XTZ or tzBTC as the token to swap. Let's start with tzBTC as the preparation of the transaction is more complicated:

```typescript=
if (tokenFrom === "tzBTC") {
	const tzBtcContract = await $store.Tezos.wallet.at(tzbtcAddress);
	const tokensSold = Math.floor(+inputFrom * 10 ** tzBTC.decimals);
	let batch = $store.Tezos.wallet
	  .batch()
	  .withContractCall(tzBtcContract.methods.approve(dexAddress, 0))
	  .withContractCall(
		tzBtcContract.methods.approve(dexAddress, tokensSold)
	  )
	  .withContractCall(
		lbContract.methods.tokenToXtz(
		  $store.userAddress,
		  tokensSold,
		  minimumOutput,
		  deadline
		)
	  )
	  .withContractCall(tzBtcContract.methods.approve(dexAddress, 0));
	const batchOp = await batch.send();
	await batchOp.confirmation();
  }
```

The major difference between swapping XTZ to tzBTC and swapping tzBTC to XTZ is that the latter requires 3 additional operations: one to set the current permission for the LB DEX (if any) to zero, one to register the LB DEX as an operator within the tzBTC contract with the amount of tokens that it is allowed to spend on behalf of the user and one to set this amount back to zero and avoid later uses of the given permission.

>*Note: you can read more about the behaviours of the tzBTC contract and other FA1.2 contracts [here](https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-7/tzip-7.md)*.

First, we create the `ContractAbstraction` for the tzBTC contract as we are about to interact with it. Once done, we calculate the amount of tokens we should approve based on our previous calculations.