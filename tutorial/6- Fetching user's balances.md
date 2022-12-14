One of the most important features of the dapp which is also among the easiest ones to overlook is fetching the user's balances. Users can tell something is wrong if their balances don't show properly or don't update accordingly after an interaction with the contract, that's why it's crucial to take care of displaying and updating their balances.

Because we are going to fetch balances in different components of our application, we will create a function in the `utils.ts` file and import it when necessary.

In order to fetch the balances, we will use Taquito for the XTZ balance of the user and a very popular API on Tezos for tzBTC and SIRS balances, the [TzKT API](https://api.tzkt.io/). If you want to build more complex applications on Tezos, a good knowledge of the TzKT API is essential as it provides a lot of features that will make your apps richer in content and faster.

Let's have a look at the function type:

```typescript=
export const fetchBalances = async (
  Tezos: TezosToolkit,
  userAddress: TezosAccountAddress
): Promise<{
  xtzBalance: number;
  tzbtcBalance: number;
  sirsBalance: number;
} | null> => {
	try {
	// the code will come here
  } catch (error) {
    console.error(error);
    return null;
  }
}
```

The `fetchBalances` function will take 2 parameters: an instance of the `TezosToolkit` to fetch the user's XTZ balance and the user's address to retrieve the balances that match the address. It will return an object with 3 properties: `xtzBalance`, `tzbtcBalance`, and `sirsBalance` or `null` if any error occurs.

First, let's fetch the XTZ balance:

```typescript=
const xtzBalance = await Tezos.tz.getBalance(userAddress);
if (!xtzBalance) throw "Unable to fetch XTZ balance";
```

The instance of the `TezosToolkit` includes a property called `tz` that allows different Tezos-specific actions, one of them is about fetching the balance of an account by its address through the `getBalance()` method that takes the address of the account as a parameter.

Next, we check for the existence of a balance and we reject the promise if it doesn't exist. If it does, the balance will be available as a [BigNumber](https://mikemcl.github.io/bignumber.js/).

>*Note: as it is the case most of the time, Taquito returns numeric values from the blockchain as BigNumber, because some values could be very big numbers and JavaScript is notorious for being bad at handling large numbers*

Once the XTZ balance has been fetched, we can continue and fetch the balances of tzBTC and SIRS:

```typescript=
import { tzbtcAddress, sirsAddress } from "./config";

// previous code for the function

const res = await fetch(
      `https://api.tzkt.io/v1/tokens/balances?account=${userAddress}&token.contract.in=${tzbtcAddress},${sirsAddress}`
    );
    if (res.status === 200) {
      const data = await res.json();
      if (Array.isArray(data) && data.length === 2) {
        const tzbtcBalance = +data[0].balance;
        const sirsBalance = +data[1].balance;
        if (!isNaN(tzbtcBalance) && !isNaN(sirsBalance)) {
          return {
            xtzBalance: xtzBalance.toNumber(),
            tzbtcBalance,
            sirsBalance
          };
        } else {
          return null;
        }
      }
    } else {
      throw "Unable to fetch tzBTC and SIRS balances";
    }
```

You can check [this link](https://api.tzkt.io/#operation/Tokens_GetTokenBalances) to get more details about how to fetch token balances with the TzKT API. It's a simple `fetch` with a URL that is built dynamically to include the user's address and the addresses of the contracts for tzBTC and SIRS.

When the promise resolves with a `200` code, this means that the data has been received. We parse it into JSON with the `.json()` method on the response and we check that the data has the expected shape, i.e. an array with 2 elements in it.

The first element is the tzBTC balance and the second one is the SIRS balance. We store them in their own variables that we cast to numbers before verifying that they were cast properly with `isNaN`. If everything goes well, the 3 balances are returned and if anything goes wrong along the way, the function returns `null`.

After fetching the balances in any component of our application, we store this data in the store to update the state:

```typescript=
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
```

And that's it to fetch the user's balances in XTZ, tzBTC, and SIRS!