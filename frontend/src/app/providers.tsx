'use client'

import { ReactNode } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { bscTestnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

const config = getDefaultConfig({
    appName: 'Forge.fun',
    projectId: 'forge-fun-dev', // Replace with real WalletConnect projectId for production
    chains: [bscTestnet],
    transports: {
        [bscTestnet.id]: http('https://data-seed-prebsc-1-s1.binance.org:8545'),
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
