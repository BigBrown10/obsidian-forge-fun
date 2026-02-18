'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import HardwareConnect from './HardwareConnect'
import { Plus, Menu, X, LayoutGrid, Egg, User, Rocket, Activity } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import { clsx, type ClassValue } from 'clsx'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const NAV_ITEMS = [
    { name: 'Live Feed', href: '/', icon: Activity },
    { name: 'Incubator', href: '/incubator', icon: Egg },
    { name: 'Profile', href: '/profile', icon: User },
]

export default function Header() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    return (
        <>
            <header className="flex justify-between md:justify-end items-center gap-4 mb-8">
                {/* Mobile Hamburger */}
                <button
                    onClick={() => setIsOpen(true)}
                    className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4">
                    <Link
                        href="/create"
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-dim text-white font-bold text-sm tracking-wide transition-all shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">LAUNCH</span>
                    </Link>

                    {/* Replaced custom button with standard for reliability */}
                    <div className="rainbow-button-wrapper">
                        <HardwareConnect />
                    </div>
                </div>
            </header>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[280px] bg-[#0A0A0B] border-r border-white/10 z-50 p-6 flex flex-col md:hidden"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <img src="/logo.png" alt="Forge" className="h-32 w-auto object-contain" />
                                </div>
                                <button onClick={() => setIsOpen(false)} className="p-2 text-text-dim hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="space-y-2">
                                {NAV_ITEMS.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
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
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
