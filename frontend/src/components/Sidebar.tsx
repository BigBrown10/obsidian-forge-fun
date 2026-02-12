'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
    { href: '/', label: 'Home', icon: '⚡' },
    { href: '/create', label: 'Create Agent', icon: '✦' },
    { href: '/incubator', label: 'Incubator', icon: '⬡' },
    { href: '/profile', label: 'Profile', icon: '◉' },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="hidden md:flex flex-col w-[220px] min-h-screen border-r border-border-subtle bg-surface shrink-0">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 px-5 py-5 border-b border-border-subtle">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-black font-bold text-sm">
                    F
                </div>
                <span className="font-bold text-base tracking-tight">forge.fun</span>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 py-3 px-3">
                <ul className="space-y-0.5">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                                            ? 'bg-[rgba(0,230,118,0.08)] text-accent'
                                            : 'text-text-secondary hover:text-text-primary hover:bg-card'
                                        }`}
                                >
                                    <span className="text-base">{item.icon}</span>
                                    {item.label}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Bottom */}
            <div className="p-4 border-t border-border-subtle">
                <div className="text-xs text-text-dim">
                    Built on BNB Chain
                </div>
            </div>
        </aside>
    )
}
