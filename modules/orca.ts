import {
    address,
    Address,
    pipe,
    createTransactionMessage,
    setTransactionMessageFeePayer,
    setTransactionMessageLifetimeUsingBlockhash,
    appendTransactionMessageInstructions,
    getComputeUnitEstimateForTransactionMessageFactory,
    prependTransactionMessageInstructions,
    signTransactionMessageWithSigners,
    getBase64EncodedWireTransaction
} from '@solana/web3.js';
import { getSetComputeUnitLimitInstruction, getSetComputeUnitPriceInstruction } from '@solana-program/compute-budget';
import { setDefaultFunder, swapInstructions } from '@orca-so/whirlpools';


export async function executeSwap(
    wallet: any,
    pool: Address,
    mintAddress: Address,
    inputAmount: bigint,
    rpc: any
): Promise<void> {
    try {
        await setDefaultFunder(wallet);
        const { instructions, quote } = await prepareSwapInstructions(rpc, wallet, pool, mintAddress, inputAmount);
        const transactionMessage = await prepareTransactionMessage(rpc, wallet, instructions);
        const signedTransaction = await signTransactionMessageWithSigners(transactionMessage);
        await sendTransactionWithRetry(rpc, signedTransaction);
    } catch (error) {
        console.error('Error executing swap:', error);
    }
}

export async function prepareSwapInstructions(
    rpc: any,
    wallet: any,
    pool: Address,
    mintAddress: Address,
    inputAmount: bigint
) {
    const whirlpoolAddress = address(pool);
    const mint = address(mintAddress);

    const { instructions, quote } = await swapInstructions(
        rpc,
        { inputAmount, mint },
        whirlpoolAddress,
        100, // Slippage 100 = 1%
        wallet
    );

    return { instructions, quote };
}

export async function prepareTransactionMessage(
    rpc: any,
    wallet: any,
    instructions: any[]
): Promise<any> {
    const latestBlockHash = await rpc.getLatestBlockhash().send();

    // Create the base transaction message
    const baseTransactionMessage = await pipe(
        createTransactionMessage({ version: 0 }),
        tx => setTransactionMessageFeePayer(wallet.address, tx),
        tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockHash.value, tx),
        tx => appendTransactionMessageInstructions(instructions, tx)
    );

    // Estimate compute units
    const getComputeUnitEstimateForTransactionMessage =
        getComputeUnitEstimateForTransactionMessageFactory({ rpc });

    const computeUnitEstimate = await getComputeUnitEstimateForTransactionMessage(baseTransactionMessage) + 1000;

    // Calculate median prioritization fee
    const medianPrioritizationFee = await rpc.getRecentPrioritizationFees()
        .send()
        .then((fees: { prioritizationFee: string | number }[]) =>
            fees
                .map(fee => Number(fee.prioritizationFee))
                .sort((a, b) => a - b)
            [Math.floor(fees.length / 2)]
        );

    // Enhance the transaction message
    return await prependTransactionMessageInstructions([
        getSetComputeUnitLimitInstruction({ units: computeUnitEstimate }),
        getSetComputeUnitPriceInstruction({ microLamports: medianPrioritizationFee })
    ], baseTransactionMessage);
}

export async function sendTransactionWithRetry(
    rpc: any,
    transaction: any,
    timeoutMs = 100000
): Promise<void> {
    const base64EncodedWireTransaction = getBase64EncodedWireTransaction(transaction);
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
        const transactionStartTime = Date.now();

        const signature = await rpc.sendTransaction(base64EncodedWireTransaction, {
            maxRetries: 0n,
            skipPreflight: true,
            encoding: 'base64'
        }).send();

        const statuses = await rpc.getSignatureStatuses([signature]).send();
        if (statuses.value[0]) {
            if (!statuses.value[0].err) {
                console.log(`Transaction confirmed: ${signature}`);
                return;
            } else {
                console.error(`Transaction failed: ${statuses.value[0].err.toString()}`);
                return;
            }
        }

        const elapsedTime = Date.now() - transactionStartTime;
        const remainingTime = Math.max(0, 1000 - elapsedTime);
        if (remainingTime > 0) {
            await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
    }

    console.error('Transaction timeout reached.');
}