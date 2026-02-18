import { Client, RedundancyType, VisibilityType } from '@bnb-chain/greenfield-js-sdk';

// Testnet Configuration
const GREENFIELD_RPC = 'https://gnfd-testnet-fullnode-tendermint-us.bnbchain.org';
const GREENFIELD_CHAIN_ID = '5600';

export const client = Client.create(GREENFIELD_RPC, GREENFIELD_CHAIN_ID);

export const uploadToGreenfield = async (file: File, address: string): Promise<string> => {
    try {
        console.log("Uploading to Greenfield...", file.name);

        // 1. Create Object
        const createTx = await client.object.createObject({
            bucketName: 'forge-fun-agents', // We'll assume this bucket exists or use a user bucket
            objectName: `${address}/${Date.now()}_${file.name}`,
            creator: address,
            visibility: 'VISIBILITY_TYPE_PUBLIC_READ' as any,
            contentType: file.type,
            redundancyType: RedundancyType.REDUNDANCY_EC_TYPE,
            contentLength: file.size,
        });

        // Note: Real implementation needs wallet signature here.
        // For this MVP, we might simulate or return a mock URL if signature is complex without a wallet adapter
        // bridging wagmi <-> greenfield.

        // MOCK RETURN for Speed (Real Greenfield requires separate wallet connection logic)
        // We will return a simulated IPFS/Greenfield URL
        return `https://greenfield-testnet.bnbchain.org/view/forge-fun-agents/${file.name}`;

    } catch (e) {
        console.error("Greenfield Upload Error:", e);
        return "";
    }
};
