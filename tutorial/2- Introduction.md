# Welcome to this Tezos dapp tutorial!

In this tutorial, you will learn how to set up and create a decentralized web application on Tezos. We will build together an interface for the Liquidity Baking smart contract that will allow us to interact with this DEX and perform different operations, like swapping tokens or provide liquidity. At the same time, you will be introduced to core concepts of building a decentralized application in general, but also specifically on Tezos.

As the dapp will be built with [TypeScript](https://www.typescriptlang.org/), a good knowledge of this programming language is required. We will use the [Svelte](https://svelte.dev/) framework to develop the application, no prior knowledge of it is required as it is pretty intuitive to use and I will explain how it works along the way.

As 99% of the dapps in the ecosystem, this dapp will use [Taquito](https://tezostaquito.io/), a TypeScript library that will provide a much better developer experience to use the Tezos blockchain.

## The Liquidity Baking contract

There is a special contract on Tezos called the **Liquidity Baking** contract. This contract is a decentralized exchange (or DEX) that handles only 3 tokens: **XTZ** (the native token of Tezos), **tzBTC** (a wrapped token to use Bitcoin on Tezos) and **SIRS** (for _Sirius_, the token that represents an equal amount of liquidity in XTZ and tzBTC added to the contract).

The particularity of this contract is that every time a new block is baked on Tezos, 2.5 XTZ are added to the contract. Users are expected to bring tzBTC in order to keep the DEX liquidity balanced and the price of SIRS stable.

The contract is also fully public, which means that anybody with a Tezos wallet can interact with it to swap XTZ for tzBTC and vice-versa, provide liquidity or remove it, which is what we are going to do in this tutorial.

## What are we going to build?

In this tutorial, we will build a dapp interface that interacts with the LB contract to swap tokens, add liquidity and remove it. The dapp will handle different actions:
- Displaying users' information like their XTZ, tzBTC, and SIRS balance and update them after each transaction
- Connecting and disconnecting the users' wallet
- Displaying wallet information like its connection status and the network it's connected to
- Displaying different interfaces to swap tokens, add and remove liquidity
- Allowing users to swap XTZ for tzBTC and tzBTC for XTZ
- Allowing users to add liquidity by providing XTZ and tzBTC and getting SIRS in exchange
- Allowing users to remove liquidity, i.e. to redeem SIRS tokens and get XTZ and tzBTC tokens in exchange.

## What tools are we going to use?

As the decentralized application is ultimately a web app, we will use the following tools to build it:
- **Svelte** for the JavaScript framework
- **TypeScript** to make our JavaScript code safer and more expressive
- **Sass** as a CSS preprocessor
- **Vite** to bundle the application (pronounced like *veet*)
- **Taquito** to interact with the Tezos blockchain
- **Beacon** and the wrapper library provided by Taquito to use a Tezos wallet

## Useful links

- Svelte => https://svelte.dev/
- TypeScript => https://www.typescriptlang.org/
- Sass => https://sass-lang.com/
- Vite => https://vitejs.dev/
- Taquito => https://tezostaquito.io/
- Beacon => https://docs.walletbeacon.io/
- GitHub repo with the dapp => https://github.com/claudebarde/tezos-dev-portal-tutorial