# Welcome to this Tezos dapp tutorial!

In this tutorial, you will learn how to set up and create a decentralized application on Tezos. We will build together an interface for the Liquidity Baking smart contract that will allow us to interact with this DEX and perform different operations. At the same time, you will be introduced to core concepts of building a decentralized application in general, but also specifically on Tezos.

As the dapp will be built with [TypeScript](https://www.typescriptlang.org/), a good knowledge of this programming language is required. We will use the [Svelte](https://svelte.dev/) framework to develop the application, no prior knowledge of it is required as it is pretty intuitive to use and I will explain how it works along the way.

## The Liquidity Baking contract

There is a special contract on Tezos called the **Liquidity Baking** contract. This contract is a decentralized exchange (or DEX) that handles only 3 tokens: **XTZ** (the native token of Tezos), **tzBTC** (a wrapped token to use Bitcoin on Tezos) and **SIRS** (for Sirius, the token that represents an equal amount of liquidity in XTZ and tzBTC added to the contract).

The particularity of this contract is that, every time a new block is baked on Tezos, 2.5 XTZ are added to the contract. Users are expected to bring tzBTC in order to keep the DEX liquidity balanced and the price of SIRS stable.