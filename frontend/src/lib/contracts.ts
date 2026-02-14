// Contract addresses — update after deployment
export const LAUNCHPAD_ADDRESS = '0xD165568566c2dF451EbDBfd6C5DaA0CE88809e9B' as const // Deployed to BSC Testnet

// ForgeLaunchpad ABI (key functions only)
export const LAUNCHPAD_ABI = [
    {
        inputs: [
            { name: '_name', type: 'string' },
            { name: '_ticker', type: 'string' },
            { name: '_metadataURI', type: 'string' },
            { name: '_targetAmount', type: 'uint256' },
        ],
        name: 'createProposal',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: '_proposalId', type: 'uint256' }],
        name: 'pledge',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [{ name: '_proposalId', type: 'uint256' }],
        name: 'refund',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'proposalCount',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: '', type: 'uint256' }],
        name: 'proposals',
        outputs: [
            { name: 'creator', type: 'address' },
            { name: 'name', type: 'string' },
            { name: 'ticker', type: 'string' },
            { name: 'metadataURI', type: 'string' },
            { name: 'targetAmount', type: 'uint256' },
            { name: 'pledgedAmount', type: 'uint256' },
            { name: 'createdAt', type: 'uint256' },
            { name: 'launched', type: 'bool' },
            { name: 'tokenAddress', type: 'address' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { name: '', type: 'uint256' },
            { name: '', type: 'address' },
        ],
        name: 'pledges',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'id', type: 'uint256' },
            { indexed: true, name: 'creator', type: 'address' },
            { indexed: false, name: 'name', type: 'string' },
            { indexed: false, name: 'target', type: 'uint256' },
        ],
        name: 'ProposalCreated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'id', type: 'uint256' },
            { indexed: true, name: 'user', type: 'address' },
            { indexed: false, name: 'amount', type: 'uint256' },
        ],
        name: 'Pledged',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'id', type: 'uint256' },
            { indexed: false, name: 'tokenAddress', type: 'address' },
            { indexed: false, name: 'raisedAmount', type: 'uint256' },
        ],
        name: 'Launched',
        type: 'event',
    },
] as const
// AgentSkillRegistry Address
export const SKILL_REGISTRY_ADDRESS = '0x7831569341a8aa0288917D5F93Aa5DF97aa532bE' as const

export const SKILL_REGISTRY_ABI = [
    {
        inputs: [
            { name: '_name', type: 'string' },
            { name: '_description', type: 'string' },
            { name: '_ipfsHash', type: 'string' },
            { name: '_price', type: 'uint256' },
        ],
        name: 'registerSkill',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { name: '_agentId', type: 'uint256' },
            { name: '_skillId', type: 'uint256' },
        ],
        name: 'equipSkill',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: '_agentId', type: 'uint256' }],
        name: 'getAgentSkills',
        outputs: [
            {
                components: [
                    { name: 'name', type: 'string' },
                    { name: 'description', type: 'string' },
                    { name: 'ipfsHash', type: 'string' },
                    { name: 'price', type: 'uint256' },
                    { name: 'isActive', type: 'bool' },
                ],
                name: '',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
] as const
