import { readWallets, getTokenBalance } from "./utils/wallet"
import { entryPoint } from "./utils/menu"
import { makeLogger } from "./utils/logger"
import { getRandomPool } from "./utils/liquidityPool"
import { random, randomFloat, multiplyBigInt, sleep } from "./utils/common"
import { createKeyPairSignerFromBytes, getBase58Encoder, address, createSolanaRpc } from '@solana/web3.js';
import { setWhirlpoolsConfig } from '@orca-so/whirlpools';
import { CONFIG } from './config'
import { executeSwap } from './modules/orca'


let privateKeys = readWallets('./private_keys.txt')
const rpc = createSolanaRpc(CONFIG.rpc);
await setWhirlpoolsConfig('eclipseMainnet');

async function processMultipleSwaps() {
    

    for (let privateKey of privateKeys) {
        const wallet = await createKeyPairSignerFromBytes(
            getBase58Encoder().encode(privateKey)
        );

        const logger = makeLogger(`[${wallet.address}]:`)

        const iterations = random(CONFIG.minTxCount, CONFIG.maxTxCount) / 2;
        for (let i = 1; i <= iterations; i++) {
            logger.info(`Iteration: ${i}`);

            const pool = getRandomPool();
            const tokenBalance = await getTokenBalance(wallet, pool.tokenA.name, rpc, logger);
            const multiplier = randomFloat(0.7, 0.9);
            const inputAmount = multiplyBigInt(tokenBalance, multiplier);
            
            logger.info(`Executing swap ${pool.tokenA.name} to ${pool.tokenB.name}.`)
            await executeSwap(wallet, address(pool.poolAddress), address(pool.tokenA.address), inputAmount, rpc, logger);
    
            let sleepTime = random(CONFIG.sleepFrom, CONFIG.sleepTo);
            logger.info(`💤 Sleep ${sleepTime} seconds.`)
            await sleep(sleepTime * 1000);

            const token2Balance = await getTokenBalance(wallet, pool.tokenB.name, rpc, logger);

            logger.info(`Executing swap ${pool.tokenB.name} to ${pool.tokenA.name}.`)
            await executeSwap(wallet, address(pool.poolAddress), address(pool.tokenB.address), token2Balance, rpc, logger);
            
            sleepTime = random(CONFIG.sleepFrom, CONFIG.sleepTo);
            logger.info(`💤 Sleep ${sleepTime} seconds.`);
            await sleep(sleepTime * 1000);
        }
    }
}

async function warmUpSwap() {
    const logger = makeLogger("Warm up")
}

async function startMenu() {
    let mode = await entryPoint()
    switch (mode) {
        case "process_multiple_swaps":
            await processMultipleSwaps()
            break
        case "warm_up_swap":
            await warmUpSwap()
            break
    }
}

await startMenu()