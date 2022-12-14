This one is going to be a big one, but a little less involved than swapping tokens!

The most complex part about adding liquidity to the Liquidity Baking contract is to get the amounts of tokens right! After that, it will be a walk in the park.

First, let's understand what we are doing here: the LB DEX gives you the ability to provide a pair of tokens (only 2 choices here, XTZ and tzBTC) as liquidity to enable the swapping feature. In exchange, you get SIRS tokens to represent your investment. These tokens increase in value over time, so if you wait long enough, you can make a profit when you remove your liquidity, which will be explained in the next chapter.

The interface here is going to look a lot like the interface for swapping, with some key differences:

![AddLiquidity UI](/images/add-liquidity-ui.png "Add liquidity UI")

Like before, we have 2 input fields, but this time, there is no middle button to switch between the 2 tokens and both inputs are editable.
When inputting a number in one of the fields, the dapp must calculate the corresponding amount of the other token, as well as the expected amount in SIRS that will be received.

Now, let's see how all of that is done!

### Converting the input

When the user is going to input a number in one of the fields, the input will dispatch a new event to the interface component with the name of the token involved and the amount that was input. This data will be read by the `saveInput` function:

```typescript=
const saveInput = ev => {
    const { token, val }: { token: token; val: number | null } = ev.detail;
    ...
}
```

Then, we will introduce a condition based on the token because the calculations will be different to convert an amount of XTZ into tzBTC and vice-versa. Let's start with XTZ:

```typescript=
if (token === "XTZ" && val && val > 0) {
	inputXtz = val.toString();
	let tzbtcAmount = addLiquidityTokenIn({
		xtzIn: val * 10 ** 6,
		xtzPool: $store.dexInfo.xtzPool,
		tokenPool: $store.dexInfo.tokenPool
	});
	if (tzbtcAmount) {
		inputTzbtc = tzbtcAmount.dividedBy(10 ** 8).toPrecision(6);
	} else {
		inputTzbtc = "";
	}
	...
}
```

The condition also includes a check for the value, as there is no need to process it if the value is `null` or `0`.

The value is cast to a string and stored in the `inputXtz` variable to be used later. The corresponding amount of tzBTC is calculated with the `addLiquidityTokenIn` function, another one of those useful functions to calculate different token amounts for the LB DEX, here it is for reference:

```typescript=
const addLiquidityTokenIn = (p: {
  xtzIn: BigNumber | number;
  xtzPool: BigNumber | number;
  tokenPool: BigNumber | number;
}): BigNumber | null => {
  const { xtzIn, xtzPool, tokenPool } = p;
  let xtzIn_ = new BigNumber(0);
  let xtzPool_ = new BigNumber(0);
  let tokenPool_ = new BigNumber(0);
  try {
    xtzIn_ = new BigNumber(xtzIn);
    xtzPool_ = creditSubsidy(xtzPool);
    tokenPool_ = new BigNumber(tokenPool);
  } catch (err) {
    return null;
  }
  if (
    xtzIn_.isGreaterThan(0) &&
    xtzPool_.isGreaterThan(0) &&
    tokenPool_.isGreaterThan(0)
  ) {
    return ceilingDiv(xtzIn_.times(tokenPool_), xtzPool_);
  } else {
    return null;
  }
};
```

We check the output of `addLiquidityTokenIn` and we update the `inputTzbtc` variable.

If the user inputs an amount in tzBTC, the steps will be very similar to calculate the corresponding amount in XTZ:

```typescript=
else if (token === "tzBTC" && val && val > 0) {
  inputTzbtc = val.toString();
  let xtzAmount = tokenToXtzXtzOutput({
	tokenIn: val * 10 ** 8,
	xtzPool: $store.dexInfo.xtzPool,
	tokenPool: $store.dexInfo.tokenPool
  });
  if (xtzAmount) {
	inputXtz = xtzAmount.dividedBy(10 ** 6).toPrecision(8);

	...
  } else {
	inputXtz = "";
  }
}
```

We also need to check that the provided value is correct, after what we use the `tokenToXtzXtzOutput` function to get the corresponding amount of XTZ to create a valid pair and provide liquidity:

```typescript=
const tokenToXtzXtzOutput = (p: {
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

Once this is calculated, we store the result in the `inputXtz` variable for later use.

### Calculating the expected amount of SIRS

Now, we have to calculate the corresponding amount of SIRS that will be created if `inputXtz` and `inputTzbtc` are provided as parameters to add liquidity. The `addLiquidityLiquidityCreated` function does all the hard work for us:

```typescript=
const addLiquidityLiquidityCreated = (p: {
  xtzIn: BigNumber | number;
  xtzPool: BigNumber | number;
  totalLiquidity: BigNumber | number;
}): BigNumber | null => {
  const { xtzIn, xtzPool, totalLiquidity } = p;
  let xtzIn_ = new BigNumber(0);
  let xtzPool_ = new BigNumber(0);
  let totalLiquidity_ = new BigNumber(0);
  try {
    xtzIn_ = new BigNumber(xtzIn);
    xtzPool_ = new BigNumber(xtzPool);
    totalLiquidity_ = new BigNumber(totalLiquidity);
  } catch (err) {
    return null;
  }
  xtzPool_ = creditSubsidy(xtzPool_);

  if (xtzIn_.isGreaterThan(0) && xtzPool_.isGreaterThan(0)) {
    if (totalLiquidity_.isEqualTo(0)) {
      return new BigNumber(xtzIn)
        .times(new BigNumber(totalLiquidity))
        .dividedBy(new BigNumber(xtzPool));
    } else if (totalLiquidity_.isGreaterThan(0)) {
      return new BigNumber(xtzIn)
        .times(new BigNumber(totalLiquidity))
        .dividedBy(new BigNumber(xtzPool));
    }

    return null;
  } else {
    return null;
  }
};
```

This function takes 3 parameters:
1. the amount of XTZ you want to add as liquidity
2. the current state of the XTZ pool
3. the total amount of liquidity available in the contract (i.e. the SIRS tokens)

It will output the amount of SIRS created after the transaction. This amount is stored in the `sirsOutput` variable to be displayed in the interface.

### Adding liquidity

After we calculated all the values we need to add liquidity to the Liquidity Baking contract, it's time to forge the transaction!

```typescript=
const addLiquidity = async () => {
    try {
      if (inputXtz && inputTzbtc && sirsOutput) {
        addLiquidityStatus = TxStatus.Loading;
        store.updateToast(
          true,
          "Adding liquidity, waiting for confirmation..."
        );

        const tzbtcForLiquidity = Math.floor(
          +inputTzbtc * 10 ** tzBTC.decimals
        );

        const lbContract = await $store.Tezos.wallet.at(dexAddress);
        const tzBtcContract = await $store.Tezos.wallet.at(tzbtcAddress);
    ...

}
```

First, we check that the 3 values we need, the amounts of XTZ, tzBTC, and SIRS are available. If it is the case, we update the UI by switching the `addLiquidityStatus` variable to `TxStatus.Loading` and by displaying a simple toast with a message.

After that, we convert the amount of tzBTC we got into its "real" value, i.e. the value without decimal points as stored in its contract.

Then, we create the `ContractAbstraction` for the LB DEX and the `ContractAbstraction` for the tzBTC contract, as we will interact with both.

>*Note: remember, every time your users want to use tzBTC with the LB DEX, the amount of tokens that will be used needs to be approved at the tzBTC contract level, which requires 3 different operations.*

At this point, you may have guessed that we have to create a batched transaction, but let's do it in a different way from the previous chapter, so you can choose the way you prefer:

```typescript=
const batch = $store.Tezos.wallet.batch([
  {
	kind: OpKind.TRANSACTION,
	...tzBtcContract.methods.approve(dexAddress, 0).toTransferParams()
  },
  {
	kind: OpKind.TRANSACTION,
	...tzBtcContract.methods
	  .approve(dexAddress, tzbtcForLiquidity)
	  .toTransferParams()
  },
  {
	kind: OpKind.TRANSACTION,
	...lbContract.methodsObject
	  .addLiquidity({
		owner: $store.userAddress,
		minLqtMinted: sirsOutput,
		maxTokensDeposited: tzbtcForLiquidity,
		deadline: calcDeadline()
	  })
	  .toTransferParams(),
	amount: +inputXtz
  },
  {
	kind: OpKind.TRANSACTION,
	...tzBtcContract.methods.approve(dexAddress, 0).toTransferParams()
  }
]);

const batchOp = await batch.send();
await batchOp.confirmation();
```

In the previous chapter, the batched transaction was created using the `withContractCall` method available on the `batch` method. Here, we will actually pass a parameter to the `batch()` method, an array containing multiple objects that each represent an operation.

The first operation:
```typescript=
{
kind: OpKind.TRANSACTION,
...tzBtcContract.methods.approve(dexAddress, 0).toTransferParams()
}
```
is the transaction required to set the amount of approved tzBTC for the LB DEX to zero.

The second operation:
```typescript=
{
kind: OpKind.TRANSACTION,
...tzBtcContract.methods
  .approve(dexAddress, tzbtcForLiquidity)
  .toTransferParams()
}
```
sets the amount of approved tzBTC for the LB DEX contract.

The third operation:
```typescript=
{
	kind: OpKind.TRANSACTION,
	...lbContract
		.methodsObject
		.addLiquidity({
			owner: $store.userAddress,
			minLqtMinted: sirsOutput,
			maxTokensDeposited: tzbtcForLiquidity,
			deadline: calcDeadline()
		})
		.toTransferParams(),
	amount: +inputXtz
}
```
is the actual `addLiquidity` operation to provide the pair of tokens to the contract and receive SIRS tokens in exchange. The entrypoint expects 4 parameters (represented here as an object thanks to the `methodsObject` method):
1. the address of the account that will receive the SIRS tokens
2. the minimum amount of SIRS tokens expected to be received
3. the amount of tzBTC deposited
4. the deadline

>*Note: look how the attached amount of tez is passed to the operation as the last property of the operation object. It is important to put it after `.toTransferParams()` or it would be overwritten with the default amount of tez, which is zero.*

The fourth operation:
```typescript=
{
	kind: OpKind.TRANSACTION,
	...tzBtcContract.methods.approve(dexAddress, 0).toTransferParams()
}
```
resets the allowed amount of tzBTC to be used by the LB DEX to zero.

Then, just like any other transaction forged through Taquito, you call `.send()` and `.confirmation()` on the operation object to wait for one confirmation.

Once the transaction is confirmed, you clear the UI before fetching the new balances of XTZ, tzBTC, and SIRS.

If the transaction failed, you update the UI and provide visual feedback to the users:

```typescript=
addLiquidityStatus = TxStatus.Error;
store.updateToast(true, "An error has occurred");
```

After all these steps, you can reset the interface to its previous state, maybe the user wants to add more liquidity!

```typescript=
setTimeout(() => {
	addLiquidityStatus = TxStatus.NoTransaction;
	store.showToast(false);
}, 3000);
```

And that's it! Your users have now the ability to add liquidity to the Liquidity Baking DEX and invest their XTZ and tzBTC.