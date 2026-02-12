'use client'

import { useState } from 'react'

const TABS = ['Trending', 'New', 'Top', 'Finishing Soon']

export default function FilterTabs({ onFilter }: { onFilter: (tab: string) => void }) {
    const [active, setActive] = useState('Trending')

    return (
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {TABS.map((tab) => (
                <button
                    key={tab}
                    onClick={() => { setActive(tab); onFilter(tab) }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${active === tab
                            ? 'bg-accent text-black'
                            : 'text-text-secondary hover:text-text-primary hover:bg-card'
                        }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    )
}
