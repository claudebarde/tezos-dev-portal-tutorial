Removing liquidity from the Liquidity Baking contract is arguably the easiest of all the tasks accomplished by our interface. The interface only needs one input to receive the amount of SIRS that the user wants to unwrap to get XTZ and tzBTC.

![RemoveLiquidity UI](/images/remove-liquidity-ui.png "Remove liquidity UI")

The dapp will then calculate the corresponding amount of XTZ and tzBTC expected to be received for the amount of SIRS in the input field.

In the `lbUtils.ts` file, you will find the `removeLiquidityXtzTzbtcOut` function to calculate these amounts:

```typescript=
const outputRes = removeLiquidityXtzTzbtcOut({
	liquidityBurned: val,
	totalLiquidity: $store.dexInfo.lqtTotal.toNumber(),
	xtzPool: $store.dexInfo.xtzPool.toNumber(),
	tokenPool: $store.dexInfo.tokenPool.toNumber()
  });
  if (outputRes) {
	const { xtzOut, tzbtcOut } = outputRes;
	xtzOutput = xtzOut
	  .decimalPlaces(0, 1)
	  .dividedBy(10 ** 6)
	  .decimalPlaces(6)
	  .toNumber();
	tzbtcOutput = tzbtcOut
	  .decimalPlaces(0, 1)
	  .dividedBy(10 ** 8)
	  .decimalPlaces(8)
	  .toNumber();
  }
```

This function takes an object as parameter with 4 properties:
- `liquidityBurned` -> the amount of SIRS to burn
- `totalLiquidity` -> the total amount of SIRS tokens in the contract
- `xtzPool` -> the total amount of XTZ tokens in the contract
- `tokenPool` -> the total amount of tzBTC tokens in the contract

If the function has been able to calculate the amounts of XTZ and tzBTC, they are returned in an object, otherwise `null` is returned. After that, those amounts can be displayed in the interface.

Now, let's see how to interact with the `removeLiquidity` entrypoint of the contract. First, we create a `removeLiquidity` function within our TypeScript code that will be triggered when the user clicks on the `Remove liquidity` button:

```typescript=
const removeLiquidity = async () => {
    try {
      if (inputSirs) {
        removeLiquidityStatus = TxStatus.Loading;
        store.updateToast(
          true,
          "Removing liquidity, waiting for confirmation..."
        );

        const lbContract = await $store.Tezos.wallet.at(dexAddress);
        
    ...

};
```

The function starts by checking if there is an amount of SIRS that was input before the remove liquidity action was triggered. If that's the case, the `removeLiquidityStatus` is set to `loading` to update the UI and inform the user that the transaction is getting ready. A toast will also be displayed.

Next, a `ContractAbstraction` is created for the LB DEX in order to interact with it from Taquito.

Now, we can forge the actual transaction:

```typescript=
const op = await lbContract.methodsObject
  .removeLiquidity({
	to: $store.userAddress,
	lqtBurned: inputSirs,
	minXtzWithdrawn: Math.floor(xtzOutput * 10 ** XTZ.decimals),
	minTokensWithdrawn: Math.floor(tzbtcOutput * 10 ** tzBTC.decimals),
	deadline: calcDeadline()
  })
  .send();
await op.confirmation();
```

The `removeLiquidity` entrypoint expects 5 parameters:
1. `to` -> the account that will receive the XTZ and tzBTC
2. `lqtBurned` -> the amount of SIRS to burn
3. `minXtzWithdrawn` -> the minimum amount of XTZ expected to be received
4. `minTokensWithdrawn` -> the minimum amount of tzBTC expected to be received
5. `deadline` -> just as the other entrypoint, a deadline for the transaction must be provided

After the transaction has been emitted, we call `.confirmation()` on the operation object returned by Taquito.

If the transaction was successful, we update the UI and reset the token values to let the user know:

```typescript=
removeLiquidityStatus = TxStatus.Success;
inputSirs = "";
xtzOutput = 0;
tzbtcOutput = 0;

// fetches user's XTZ, tzBTC and SIRS balances
const res = await fetchBalances($store.Tezos, $store.userAddress);
if (res) {
  store.updateUserBalance("XTZ", res.xtzBalance);
  store.updateUserBalance("tzBTC", res.tzbtcBalance);
  store.updateUserBalance("SIRS", res.sirsBalance);
} else {
  store.updateUserBalance("XTZ", null);
  store.updateUserBalance("tzBTC", null);
  store.updateUserBalance("SIRS", null);
}

store.updateToast(true, "Liquidity successfully removed!");
```

If the transaction failed, we also update the UI accordingly:

```typescript=
removeLiquidityStatus = TxStatus.Error;
store.updateToast(true, "An error has occurred");
```

And that's it, the users have now the possibility to remove SIRS tokens and get XTZ and tzBTC tokens in exchange!