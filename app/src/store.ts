import { writable } from "svelte/store";
import type { TezosToolkit } from "@taquito/taquito";
import type { BeaconWallet } from "@taquito/beacon-wallet";
import type { token } from "./types";

export type TezosContractAddress = `KT1${string}`;
export type TezosAccountAddress = `tz${"1" | "2" | "3"}${string}`;

interface State {
    Tezos: TezosToolkit;
    wallet: BeaconWallet;
    userAddress: TezosAccountAddress;
    currentView: "swap" | "add-liquidity" | "remove-liquidity";
    userBalances: { XTZ: null | number; tzBTC: null | number;  SIRS: null | number}
};

const initialState: State = {
    Tezos: undefined,
    wallet: undefined,
    userAddress: undefined,
    currentView: "swap",
    userBalances: { XTZ: null, tzBTC: null, SIRS: null}
};

const store = writable(initialState);

const state = {
    subscribe: store.subscribe,
    updateTezos: (tezos: TezosToolkit) =>
        store.update(store => ({ ...store, Tezos: tezos })),
    updateWallet: (wallet: BeaconWallet | undefined) =>
        store.update(store => ({ ...store, wallet })),
    updateUserAddress: (address: TezosAccountAddress | undefined) => {
        store.update(store => ({
            ...store,
            userAddress: address
        }));
    },
    updateView: (view: State["currentView"]) =>
        store.update(store => ({ ...store, currentView: view })),
    updateUserBalance: (token: token, balance: null | number) =>
        store.update(store => {
            if (balance >= 0) {
                return { ...store, userBalances: {...store.userBalances, [token]: balance} }
            } else {
                return store
            }
        })
};

export default state;