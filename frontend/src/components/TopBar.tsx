'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function TopBar() {
    return (
        <header className="flex items-center justify-between h-14 px-5 border-b border-border-subtle bg-surface/80 backdrop-blur-sm sticky top-0 z-30">
            {/* Mobile logo (hidden on desktop) */}
            <Link href="/" className="flex md:hidden items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-black font-bold text-xs">
                    F
                </div>
                <span className="font-bold text-sm">forge.fun</span>
            </Link>

            {/* Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md">
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder="Search agents..."
                        className="w-full h-9 pl-9 pr-4 rounded-lg bg-card border border-border-subtle text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-border-hover transition-colors"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <Link
                    href="/create"
                    className="hidden sm:flex items-center gap-1.5 h-9 px-4 rounded-lg bg-accent text-black text-sm font-semibold hover:bg-accent-dim transition-colors"
                >
                    Launch Agent
                </Link>
                <ConnectButton
                    chainStatus="icon"
                    showBalance={false}
                    accountStatus={{
                        smallScreen: 'avatar',
                        largeScreen: 'full',
                    }}
                />
            </div>
        </header>
    )
}
