'use client'

import { ReactNode } from 'react'
import { WagmiProvider, createConfig, http, fallback } from 'wagmi'
import { bscTestnet } from 'wagmi/chains'
import { queryClient } from '@/lib/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '4f9136127393266518175904d493'

const config = getDefaultConfig({
    appName: 'Forge.fun',
    projectId,
    chains: [bscTestnet],
    transports: {
        [bscTestnet.id]: fallback([
            // Official Binance Nodes (High reliability)
            http('https://data-seed-prebsc-1-s1.binance.org:8545'),
            http('https://data-seed-prebsc-2-s1.binance.org:8545'),
            http('https://bsc-testnet.bnbchain.org'),

            // Reliable Public Nodes
            http('https://bsc-testnet.publicnode.com'),
            http('https://bsc-testnet-rpc.publicnode.com'),
            http('https://api.zan.top/bsc-testnet'),
        ]),
    },
})

import { SocketConnector } from '@/components/SocketConnector'

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <SocketConnector />
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: '#a855f7',
                        accentColorForeground: '#000',
                        borderRadius: 'medium',
                        overlayBlur: 'small',
                    })}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
