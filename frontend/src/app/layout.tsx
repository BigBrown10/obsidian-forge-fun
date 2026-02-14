import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

import Providers from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
  title: 'Forge.fun – Autonomous Agent Launchpad',
  description: 'Launch autonomous AI agents with community-backed tokens on BNB Chain. No rugs, no humans — just code.',
}

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans bg-base text-text-primary selection:bg-accent/30 selection:text-white`}>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-[240px] relative z-10">
              {/* Global Background Ambience */}
              <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-accent/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-900/5 rounded-full blur-[100px]" />
              </div>

              <div className="relative z-10 p-8 max-w-[1600px] mx-auto">
                <Header />
                {children}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
