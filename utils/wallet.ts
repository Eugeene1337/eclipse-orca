import fs from "fs"
import { findAssociatedTokenPda, TOKEN_2022_PROGRAM_ADDRESS } from "@solana-program/token-2022"
import { address, KeyPairSigner} from '@solana/web3.js';
import { TOKENS } from '../config'



export function readWallets(filePath: string) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line !== '');
        return lines;
    } catch (error) {
        console.error('Error reading the file:', error.message);
        return [];
    }
}

export async function getTokenBalance(
    wallet: KeyPairSigner<string>,
    token: string,
    rpc: any,
    logger: any,
): Promise<bigint> {
    if(token == 'ETH'){
        const { value: balance } = await rpc.getBalance(wallet.address).send();
    
        logger.info(`Balance: ${Number(balance) / 1_000_000_000} ETH`);

        return BigInt(balance);
    }
    else{
        const mintAddress = address(TOKENS[token]);
        
        const [tokenAccount] = await findAssociatedTokenPda({
            mint: mintAddress,
            owner: wallet.address,
            tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
        });
        const { value: { amount, decimals } } = await rpc
            .getTokenAccountBalance(tokenAccount)
            .send();

        const scale = decimals === 6 ? 1_000_000 : 1_000_000_000;
        logger.info(`Balance: ${Number(amount) / scale} ${token}`);

        return BigInt(amount);
    }
}