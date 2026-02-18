'use client'

import { ReactNode } from 'react'
import { WagmiProvider, createConfig, http, fallback } from 'wagmi'
import { bscTestnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '4f91361273932Z66518175904d493'

const config = getDefaultConfig({
    appName: 'Forge.fun',
    projectId,
    chains: [bscTestnet],
    transports: {
        [bscTestnet.id]: fallback([
            http('https://data-seed-prebsc-1-s1.binance.org:8545'),
            http('https://data-seed-prebsc-2-s1.binance.org:8545'),
            http('https://bsc-testnet.publicnode.com'),
            http('https://solitary-cosmopolitan-spring.bsc-testnet.quiknode.pro/74a812ca2250e088bbae24b32d10ed922a6c02a8/'),
        ]),
    },
})

const queryClient = new QueryClient()

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
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
