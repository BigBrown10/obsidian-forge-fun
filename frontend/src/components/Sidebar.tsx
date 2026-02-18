'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Egg, Hammer, User, Settings, LogOut, Github, Twitter, Rocket, Activity } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { clsx, type ClassValue } from 'clsx'
import HardwareConnect from './HardwareConnect'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const NAV_ITEMS = [
    { name: 'Live Feed', href: '/', icon: Activity },
    { name: 'Incubator', href: '/incubator', icon: Egg },
    { name: 'Profile', href: '/profile', icon: User },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="fixed top-0 left-0 h-screen w-[240px] bg-surface/80 backdrop-blur-xl border-r border-white/5 hidden md:flex flex-col z-50">
            {/* Logo Area */}
            <div className="h-24 flex items-center px-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Forge" className="h-[72px] w-auto object-contain" />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-8 px-4 space-y-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-white/10 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                                    : "text-text-secondary hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors",
                                isActive ? "text-accent" : "text-text-dim group-hover:text-white"
                            )} />
                            <span className="font-medium text-sm tracking-wide">{item.name}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(124,58,237,0.8)]" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer / User Area */}
            <div className="p-4 border-t border-white/5">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex gap-2">
                        <button className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors flex items-center justify-center">
                            <Settings className="w-3 h-3" />
                        </button>
                        <button className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors flex items-center justify-center">
                            <Github className="w-3 h-3" />
                        </button>
                    </div>
                </div>
                <div className="mt-4 text-center text-[10px] text-text-dim font-mono">
                    v2.5.0 (SYNC)
                </div>
            </div>
        </aside>
    )
}
