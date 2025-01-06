export const CONFIG = {
    rpc: 'https://eclipse.helius-rpc.com',
    sleepFrom: 200,
    sleepTo: 300,
    maxAddressTxCount: 100,
    shuffleWallets: false,
}

export const POOLS : PoolConfig = {
    ETH_TETH: {
        address: "BqinHKam4jX8NUYbj2LsMnBYbqFnPvggiyx4PBHPkhSo",
        tokenA: "ETH",
        tokenB: "TETH",
    },
    ETH_USDC: {
        address: "44w4HrojzxKwxEb3bmjRNcJ4irFhUGBUjrCYecYhPvqq",
        tokenA: "ETH",
        tokenB: "USDC",
    },
    ETH_SOL: {
        address: "E6AFbRkMwidQyBQ872e9kbVT2ZqybmM6dJ2Zaa6sVxJq",
        tokenA: "ETH",
        tokenB: "SOL",
    },
};

export const TOKENS : TokenConfig = {
    ETH: "So11111111111111111111111111111111111111112",
    TETH: "GU7NS9xCwgNPiAdJ69iusFrRfawjDDPjeMBovhV1d4kn",
    USDC: "AKEWE7Bgh87GPp171b4cJPSSZfmZwQ3KaqYqXoKLNAEE",
    SOL: "BeRUj3h7BqkbdfFU7FBNYbodgf8GCHodzKvF9aVjNNfL",
};

type PoolConfig = {
    [key: string]: { address: string; tokenA: string; tokenB: string };
};

type TokenConfig = {
    [key: string]: string;
};