import { readWallets } from "./utils/wallet"
import { entryPoint } from "./utils/menu"
import { makeLogger } from "./utils/logger"
import { getRandomPool } from "./utils/liquidityPool"
import { createKeyPairSignerFromBytes, getBase58Encoder, address, createSolanaRpc } from '@solana/web3.js';
import { setWhirlpoolsConfig } from '@orca-so/whirlpools';
import { CONFIG, TOKENS } from './config'

let privateKeys = readWallets('./private_keys.txt')
const rpc = createSolanaRpc(CONFIG.rpc);
await setWhirlpoolsConfig('eclipseMainnet');

async function processMultipleSwaps() {
    const logger = makeLogger("Multiple swaps")

    for (let privateKey of privateKeys) {
        const wallet = await createKeyPairSignerFromBytes(
            getBase58Encoder().encode(privateKey)
        );
        const randomLiquidityPool = getRandomPool();
        const token = address("GU7NS9xCwgNPiAdJ69iusFrRfawjDDPjeMBovhV1d4kn");
        const result = await rpc
            .getTokenAccountsByOwner(
                wallet.address,
                { programId: token },
                { encoding: "base64" }
            )
            .send();

        console.log(`Balance: ${Number(result) / 1000000000 } tETH`);

        const inputAmount = 100_000n;


        //for count / 2
            // swap ETH to tETH
            // swap tETH to ETH
    }

    // const { value: balance } = await rpc.getBalance(wallet.address).send();
    
    // console.log(`Balance: ${Number(balance) / 1 000 000 000} ETH`);
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