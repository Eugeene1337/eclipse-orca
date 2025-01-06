import { POOLS, TOKENS } from '../config'

type PoolDetails = {
    poolName: string;
    poolAddress: string;
    tokenA: { name: string; address: string };
    tokenB: { name: string; address: string };
};

export function getRandomPool(): PoolDetails {
    const poolKeys = Object.keys(POOLS);
    const randomKey = poolKeys[Math.floor(Math.random() * poolKeys.length)];
    const pool = POOLS[randomKey];

    return {
        poolName: randomKey,
        poolAddress: pool.address,
        tokenA: { name: pool.tokenA, address: TOKENS[pool.tokenA] },
        tokenB: { name: pool.tokenB, address: TOKENS[pool.tokenB] },
    };
}