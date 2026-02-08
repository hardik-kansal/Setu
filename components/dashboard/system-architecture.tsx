'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function SystemArchitecture() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto py-8 space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🏗️ System Architecture</h1>
        <p className="text-muted-foreground">
          Technical overview of Setu's decentralized cross-chain liquidity management system
        </p>
      </div>

      {/* Contract Addresses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">📝 Smart Contract Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-lg font-medium text-emerald-400">Ethereum Sepolia (L1)</span>
                </div>
                <code className="text-sm bg-muted px-4 py-3 rounded block break-all">
                  0x010a712748b9903c90deec684f433bae57a67476
                </code>
                <a 
                  href="https://sepolia.etherscan.io/address/0x010a712748b9903c90deec684f433bae57a67476"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-400 hover:underline mt-2 inline-block"
                >
                  View on Etherscan →
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-3 w-3 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-lg font-medium text-blue-400">Base Sepolia (L2)</span>
                </div>
                <code className="text-sm bg-muted px-4 py-3 rounded block break-all">
                  0x8116cFd461C5AB410131Fd6925e6D394F0065Ee2
                </code>
                <a 
                  href="https://sepolia.basescan.org/address/0x8116cFd461C5AB410131Fd6925e6D394F0065Ee2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:underline mt-2 inline-block"
                >
                  View on BaseScan →
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">⚙️ Technical Components</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
              <h3 className="font-semibold text-lg text-indigo-400 mb-4">1. ENS Configuration</h3>
              <ul className="text-sm text-muted-foreground space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1">•</span>
                  <span>Decentralized config storage via ENS text records</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1">•</span>
                  <span>Key: <code className="text-xs bg-muted px-2 py-1 rounded">org.setu.ai_params</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1">•</span>
                  <span>Real-time parameter updates without redeployment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1">•</span>
                  <span>Censorship-resistant governance</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <h3 className="font-semibold text-lg text-emerald-400 mb-4">2. Setu Agent</h3>
              <ul className="text-sm text-muted-foreground space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Monitors liquidity across L1 & L2 chains</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Analyzes interest earnings and transfer flows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Predicts upcoming liquidity needs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Adapts strategy based on ENS config</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <h3 className="font-semibold text-lg text-purple-400 mb-4">3. LI.FI Integration</h3>
              <ul className="text-sm text-muted-foreground space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Optimal cross-chain route discovery</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Multi-DEX aggregation for best rates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Gas-optimized execution paths</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Automated transaction execution</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rebalancing Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">⚡ Rebalancing Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-lg font-bold text-indigo-400 border-2 border-indigo-500/30">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">Data Collection</h4>
                <p className="text-muted-foreground">
                  AI fetches liquidity snapshots, interest earnings, and pending unlock events from both chains. 
                  System monitors USDC balances and yield generation in real-time.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-lg font-bold text-emerald-400 border-2 border-emerald-500/30">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">AI Analysis</h4>
                <p className="text-muted-foreground">
                  Setu Agent analyzes system state using ENS governance parameters and calculates optimal rebalance amount. 
                  Considers gas costs, bridge fees, and time to execution.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-lg font-bold text-purple-400 border-2 border-purple-500/30">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">Route Optimization</h4>
                <p className="text-muted-foreground">
                  LI.FI SDK queries multiple bridges and DEXs to find the most cost-effective cross-chain route. 
                  Compares options like Stargate, Across, and native bridges.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center text-lg font-bold text-pink-400 border-2 border-pink-500/30">
                4
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">Execution</h4>
                <p className="text-muted-foreground">
                  Upon operator approval, transaction is executed with full transparency and on-chain verification. 
                  All actions are logged and auditable.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">✨ Innovation Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Zero-trust decentralized configuration</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    All parameters stored on-chain via ENS, no centralized servers
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Autonomous AI decision-making</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Setu Agent adapts to market conditions without human intervention
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Cross-chain liquidity optimization</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Intelligent rebalancing across L1 and L2 for maximum efficiency
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Human-readable ENS identities</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    User-friendly addresses and decentralized identity layer
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">🎯 Business Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Automated liquidity management</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Reduce operational overhead with AI-driven rebalancing
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Reduced operational overhead</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    No manual monitoring or intervention required
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Optimized capital efficiency</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Maximize yield while maintaining liquidity where needed
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Transparent audit trail</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    All decisions and transactions recorded on-chain
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">🛠️ Technology Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-indigo-400">Frontend</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Next.js 14 (App Router)</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS</li>
                <li>• Framer Motion</li>
                <li>• Wagmi + Viem</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-emerald-400">Smart Contracts</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Solidity 0.8.20</li>
                <li>• OpenZeppelin</li>
                <li>• Hardhat</li>
                <li>• Tenderly for monitoring</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-purple-400">Infrastructure</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• ENS (Configuration)</li>
                <li>• LI.FI SDK (Bridging)</li>
                <li>• Setu Agent (AI)</li>
                <li>• Supabase (Analytics)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
