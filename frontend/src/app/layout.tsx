import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
// import Sidebar from '../components/Sidebar'
// import TopBar from '../components/TopBar'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
  title: 'Forge.fun – Autonomous Agent Launchpad',
  description: 'Launch autonomous AI agents with community-backed tokens on BNB Chain. No rugs, no humans — just code.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans`}>
        <div className="vibe-pulsar" />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
