// Contract addresses — update after deployment
export const INSTANT_LAUNCHER_ADDRESS = '0x849D1B9A3E4f63525cc592935d8F0af6fEb406A6'
export const INCUBATOR_VAULT_ADDRESS = '0x1c22090f25A3c4285Dd58bd020Ee5e0a9782157f' as const

// Legacy alias for backward compatibility until refactor complete
export const LAUNCHPAD_ADDRESS = INCUBATOR_VAULT_ADDRESS

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

// InstantLauncher ABI
export const INSTANT_LAUNCHER_ABI = [
    {
        inputs: [
            { name: '_name', type: 'string' },
            { name: '_ticker', type: 'string' },
            { name: '_metadataURI', type: 'string' },
        ],
        name: 'launchInstant',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'tokenAddress', type: 'address' },
            { indexed: true, name: 'creator', type: 'address' },
            { indexed: false, name: 'ticker', type: 'string' },
            { indexed: false, name: 'raisedAmount', type: 'uint256' },
        ],
        name: 'InstantLaunch',
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

// PancakeSwap V2 Router (BSC Testnet)
export const ROUTER_ADDRESS = '0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3' as const

export const ROUTER_ABI = [
    {
        inputs: [
            { name: 'amountOutMin', type: 'uint256' },
            { name: 'path', type: 'address[]' },
            { name: 'to', type: 'address' },
            { name: 'deadline', type: 'uint256' }
        ],
        name: 'swapExactETHForTokens',
        outputs: [{ name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            { name: 'amountIn', type: 'uint256' },
            { name: 'amountOutMin', type: 'uint256' },
            { name: 'path', type: 'address[]' },
            { name: 'to', type: 'address' },
            { name: 'deadline', type: 'uint256' }
        ],
        name: 'swapExactTokensForETH',
        outputs: [{ name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'nonpayable',
        type: 'function'
    }
] as const
