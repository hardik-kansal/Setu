'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';

interface UnlockData {
  chainA: number;
  chainB: number;
  count: number;
  details: Array<{
    id: string;
    unlock_timestamp: string;
    amount_chain_a: string;
    amount_chain_b: string;
  }>;
}

interface UpcomingUnlocksDisplayProps {
  unlocks: UnlockData | null;
}

export function UpcomingUnlocksDisplay({ unlocks }: UpcomingUnlocksDisplayProps) {
  if (!unlocks) return null;

  const totalUnlocks = unlocks.chainA + unlocks.chainB;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="bg-gradient-to-br from-purple-950 to-slate-900 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Unlock className="h-5 w-5 text-purple-400" />
              <span className="text-purple-400">Upcoming Unlocks (24h)</span>
            </div>
            <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/50">
              {unlocks.count} Pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-400 text-xs mb-1">
                <TrendingUp className="h-3 w-3" />
                Chain A (Sepolia)
              </div>
              <div className="text-2xl font-bold text-white">
                ${unlocks.chainA.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1">USDC Available</div>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-400 text-xs mb-1">
                <TrendingUp className="h-3 w-3" />
                Chain B (Base)
              </div>
              <div className="text-2xl font-bold text-white">
                ${unlocks.chainB.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1">USDC Available</div>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-400 text-xs mb-1">
                <Clock className="h-3 w-3" />
                Total Unlocking
              </div>
              <div className="text-2xl font-bold text-purple-400">
                ${totalUnlocks.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1">Next 24 Hours</div>
            </div>
          </div>

          {/* Detailed List */}
          {unlocks.details.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-300 mb-2">Unlock Schedule:</div>
              <div className="max-h-[200px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-slate-800">
                {unlocks.details.map((unlock, index) => {
                  const unlockTime = new Date(unlock.unlock_timestamp);
                  const chainAAmount = parseFloat(unlock.amount_chain_a || '0');
                  const chainBAmount = parseFloat(unlock.amount_chain_b || '0');
                  
                  return (
                    <div 
                      key={unlock.id}
                      className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg border border-slate-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm text-white font-medium">
                            {unlockTime.toLocaleTimeString()} • {unlockTime.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-slate-400">
                            Chain A: ${chainAAmount.toLocaleString()} | Chain B: ${chainBAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-white">
                          ${(chainAAmount + chainBAmount).toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-400">Total</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {unlocks.details.length === 0 && (
            <div className="p-4 text-center text-slate-400 text-sm">
              No unlocks scheduled in the next 24 hours
            </div>
          )}

          {/* Info Notice */}
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <p className="text-xs text-purple-400/80">
              💡 Upcoming unlocks represent liquidity that will become available soon. 
              Setu-Agent factors this into rebalancing decisions to ensure sufficient liquidity.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
