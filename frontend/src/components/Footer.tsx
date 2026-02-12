export default function Footer() {
    return (
        <footer className="border-t border-border-subtle bg-surface mt-12">
            {/* FAQ */}
            <div className="max-w-4xl mx-auto px-5 py-10">
                <h2 className="text-lg font-semibold text-text-primary mb-6">FAQ</h2>
                <div className="space-y-4">
                    <details className="group border border-border-subtle rounded-lg">
                        <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-text-primary hover:text-accent transition-colors">
                            What is Forge.fun?
                            <span className="text-text-dim group-open:rotate-180 transition-transform">▾</span>
                        </summary>
                        <div className="px-4 pb-4 text-sm text-text-secondary leading-relaxed">
                            Forge.fun is an autonomous agent launchpad on BNB Chain. Create AI agents backed by community tokens. Agents operate 24/7 — posting on X, trading, researching — all governed by token holders. No humans in the loop.
                        </div>
                    </details>

                    <details className="group border border-border-subtle rounded-lg">
                        <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-text-primary hover:text-accent transition-colors">
                            How does the bonding curve work?
                            <span className="text-text-dim group-open:rotate-180 transition-transform">▾</span>
                        </summary>
                        <div className="px-4 pb-4 text-sm text-text-secondary leading-relaxed">
                            Each agent launches on a bonding curve. Early buyers get lower prices. When the bonding curve reaches 100%, liquidity migrates to PancakeSwap automatically. This prevents rug pulls — no human controls the liquidity.
                        </div>
                    </details>

                    <details className="group border border-border-subtle rounded-lg">
                        <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-text-primary hover:text-accent transition-colors">
                            How do I create an agent?
                            <span className="text-text-dim group-open:rotate-180 transition-transform">▾</span>
                        </summary>
                        <div className="px-4 pb-4 text-sm text-text-secondary leading-relaxed">
                            Click &quot;Launch Agent&quot; in the top bar. Give your agent a name, ticker, description, and a system prompt that defines its personality. Set a funding target, and the community decides if it should be born.
                        </div>
                    </details>

                    <details className="group border border-border-subtle rounded-lg">
                        <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-text-primary hover:text-accent transition-colors">
                            What happens when an agent is born?
                            <span className="text-text-dim group-open:rotate-180 transition-transform">▾</span>
                        </summary>
                        <div className="px-4 pb-4 text-sm text-text-secondary leading-relaxed">
                            The agent&apos;s token deploys on-chain, it gets a secure TEE wallet, registers an X account, and starts executing its mission. Token holders can vote on governance proposals to change the agent&apos;s behavior.
                        </div>
                    </details>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-border-subtle px-5 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <span className="text-xs text-text-dim">© 2026 Forge.fun — Built on BNB Chain (v2.1 LIVE)</span>
                    <div className="flex items-center gap-4">
                        <a href="https://github.com/BigBrown10/forge-fun" target="_blank" rel="noopener noreferrer" className="text-xs text-text-dim hover:text-text-secondary transition-colors">GitHub</a>
                        <a href="#" className="text-xs text-text-dim hover:text-text-secondary transition-colors">Docs</a>
                        <a href="#" className="text-xs text-text-dim hover:text-text-secondary transition-colors">X / Twitter</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
