import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
  title: 'Forge.fun | The Obsidian Forge',
  description: 'Decentralized Autonomous Agent Incubator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrains.variable} bg-obsidian text-white font-sans selection:bg-electricPurple selection:text-black`}>
        {children}
      </body>
    </html>
  )
}
