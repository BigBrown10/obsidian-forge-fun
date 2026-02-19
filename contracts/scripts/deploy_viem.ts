import { createPublicClient, createWalletClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bscTestnet } from 'viem/chains';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http('https://bsc-testnet.publicnode.com')
});

const walletClient = createWalletClient({
    account,
    chain: bscTestnet,
    transport: http('https://bsc-testnet.publicnode.com')
});

const TEE_ADDRESS = "0xb6968853b05b4a784841b8a5fc2424cf374822cc";
const ROUTER_ADDRESS = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1";

async function deploy() {
    console.log('Deploying from:', account.address);

    // Load Bytecodes from Artifacts
    const instantArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/InstantLauncher.sol/InstantLauncher.json', 'utf8'));
    const incubatorArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/IncubatorVault.sol/IncubatorVault.json', 'utf8'));

    console.log('Deploying InstantLauncher...');
    const hash1 = await walletClient.deployContract({
        abi: instantArtifact.abi,
        bytecode: instantArtifact.bytecode,
        args: [TEE_ADDRESS, ROUTER_ADDRESS]
    });
    console.log('InstantLauncher deploy tx:', hash1);
    const receipt1 = await publicClient.waitForTransactionReceipt({ hash: hash1 });
    console.log('InstantLauncher deployed to:', receipt1.contractAddress);

    console.log('Deploying IncubatorVault...');
    const hash2 = await walletClient.deployContract({
        abi: incubatorArtifact.abi,
        bytecode: incubatorArtifact.bytecode,
        args: [TEE_ADDRESS, ROUTER_ADDRESS]
    });
    console.log('IncubatorVault deploy tx:', hash2);
    const receipt2 = await publicClient.waitForTransactionReceipt({ hash: hash2 });
    console.log('IncubatorVault deployed to:', receipt2.contractAddress);

    console.log('Done.');
    const output = `NEXT_PUBLIC_INSTANT_LAUNCHER_ADDRESS=${receipt1.contractAddress}\nNEXT_PUBLIC_INCUBATOR_VAULT_ADDRESS=${receipt2.contractAddress}`;
    console.log('--- ADDRESSES ---');
    console.log(output);
    fs.writeFileSync('deployed_addresses.txt', output);
}

deploy().catch(console.error);
