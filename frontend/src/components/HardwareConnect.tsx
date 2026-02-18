'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Wallet, ChevronRight, Loader2 } from 'lucide-react'

export default function HardwareConnect() {
    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
            }) => {
                const ready = mounted && authenticationStatus !== 'loading'
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                        authenticationStatus === 'authenticated')

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <button
                                        onClick={openConnectModal}
                                        className="h-10 px-6 rounded-xl bg-accent hover:bg-accent-dim text-white font-bold text-sm tracking-wide transition-all shadow-[0_0_20px_-5px_rgba(255,107,107,0.5)] active:scale-95 flex items-center gap-2"
                                    >
                                        <Wallet className="w-4 h-4" />
                                        CONNECT
                                    </button>
                                )
                            }
                            if (chain.unsupported) {
                                return (
                                    <button
                                        onClick={openChainModal}
                                        className="h-10 px-6 rounded-xl bg-red-500/10 border border-red-500/50 text-red-500 font-bold text-xs"
                                    >
                                        WRONG NETWORK
                                    </button>
                                )
                            }
                            return (
                                <button
                                    onClick={openAccountModal}
                                    className="h-10 px-6 rounded-xl bg-surface border border-white/10 hover:border-accent/50 text-white font-mono text-sm flex items-center gap-2 transition-all"
                                >
                                    <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(76,175,80,0.8)]" />
                                    {account.displayName}
                                </button>
                            )
                        })()}
                    </div>
                )
            }}
        </ConnectButton.Custom>
    )
}
