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
                                        className="group relative h-10 px-5 rounded-[14px] bg-[#0A0A0A] border border-white/10 flex items-center gap-2 overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)] active:scale-95"
                                    >
                                        {/* Inner Glow / Reflection */}
                                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-50" />

                                        <Wallet className="w-4 h-4 text-white/70 group-hover:text-white transition-colors relative z-10" />
                                        <span className="text-xs font-semibold tracking-wide text-white/90 group-hover:text-white relative z-10">
                                            CONNECT
                                        </span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/20 ml-1 group-hover:bg-purple-500 group-hover:shadow-[0_0_8px_rgba(124,58,237,0.8)] transition-all relative z-10" />
                                    </button>
                                )
                            }

                            if (chain.unsupported) {
                                return (
                                    <button
                                        onClick={openChainModal}
                                        className="h-10 px-5 rounded-[14px] bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold tracking-wide hover:bg-red-500/20 transition-all"
                                    >
                                        WRONG NETWORK
                                    </button>
                                )
                            }

                            return (
                                <button
                                    onClick={openAccountModal}
                                    className="group relative h-10 pl-3 pr-4 rounded-[14px] bg-[#0A0A0A] border border-purple-500/30 flex items-center gap-3 overflow-hidden transition-all duration-300 hover:border-purple-500/60 hover:shadow-[0_0_20px_-5px_rgba(124,58,237,0.3)] active:scale-95"
                                >
                                    <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors" />

                                    <div className="flex items-center gap-2 relative z-10">
                                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                        <span className="text-xs font-mono text-purple-200">
                                            {account.displayName}
                                        </span>
                                    </div>
                                </button>
                            )
                        })()}
                    </div>
                )
            }}
        </ConnectButton.Custom>
    )
}
