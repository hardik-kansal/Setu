'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, DollarSign, Zap, Shield, ExternalLink, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';

interface LiFiRoute {
  fromChain: string;
  toChain: string;
  amount: number;
  estimatedCost: number;
  estimatedTime: number;
  protocol: string;
  steps: Array<{
    action: string;
    protocol: string;
    estimate: string;
  }>;
}

interface AnalysisData {
  lastRebalance: {
    timestamp: string;
    chainAAfterRebalance: number;
    chainBAfterRebalance: number;
  };
  currentBalances: {
    chainA: number;
    chainB: number;
    imbalance: number;
  };
  upcomingUnlocks: {
    chainA: number;
    chainB: number;
    count: number;
    details: any[];
  };
}

interface CombinedRebalanceDisplayProps {
  route: LiFiRoute | null;
  analysisData: AnalysisData | null;
  onExecute?: () => void;
  isExecuting?: boolean;
}

export function CombinedRebalanceDisplay({ 
  route, 
  analysisData,
  onExecute,
  isExecuting = false 
}: CombinedRebalanceDisplayProps) {
  if (!route || !analysisData) return null;

  const totalUnlocks = analysisData.upcomingUnlocks.chainA + analysisData.upcomingUnlocks.chainB;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Current Balances Card - Light Theme */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-indigo-600" />
            <span className="text-slate-900">Current System State</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* Current Balances */}
            <div className="space-y-3">
              <div className="text-sm font-semibold text-slate-700 mb-2">Current Balances:</div>
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 hover:shadow-md transition-all">
                <div className="text-xs text-indigo-700 mb-1 font-medium">Chain A (Sepolia)</div>
                <div className="text-3xl font-bold text-slate-900">
                  ${analysisData.currentBalances.chainA.toLocaleString()}
                </div>
                <div className="text-xs text-slate-600 mt-1">USDC</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 hover:shadow-md transition-all">
                <div className="text-xs text-purple-700 mb-1 font-medium">Chain B (Base)</div>
                <div className="text-3xl font-bold text-slate-900">
                  ${analysisData.currentBalances.chainB.toLocaleString()}
                </div>
                <div className="text-xs text-slate-600 mt-1">USDC</div>
              </div>
            </div>

            {/* Last Rebalance */}
            <div className="space-y-3">
              <div className="text-sm font-semibold text-slate-700 mb-2">Last Rebalance:</div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-600 mb-1 font-medium">Timestamp</div>
                <div className="text-sm font-semibold text-slate-900">
                  {analysisData.lastRebalance.timestamp === new Date(0).toISOString() 
                    ? 'Never' 
                    : new Date(analysisData.lastRebalance.timestamp).toLocaleString()}
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-xl border border-red-200 hover:shadow-md transition-all">
                <div className="text-xs text-red-700 mb-1 font-medium">Current Imbalance</div>
                <div className="text-3xl font-bold text-red-600">
                  ${analysisData.currentBalances.imbalance.toLocaleString()}
                </div>
                <div className="text-xs text-orange-600 mt-1">Needs Rebalancing</div>
              </div>
            </div>
          </div>

          {/* Upcoming Unlocks Summary */}
          {totalUnlocks > 0 && (
            <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Unlock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-900">Upcoming Unlocks (24h)</span>
                </div>
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                  {analysisData.upcomingUnlocks.count} Pending
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="text-center p-2 bg-white rounded-lg border border-purple-100">
                  <div className="text-xs text-purple-600">Chain A</div>
                  <div className="text-lg font-bold text-slate-900">${analysisData.upcomingUnlocks.chainA.toLocaleString()}</div>
                </div>
                <div className="text-center p-2 bg-white rounded-lg border border-purple-100">
                  <div className="text-xs text-purple-600">Chain B</div>
                  <div className="text-lg font-bold text-slate-900">${analysisData.upcomingUnlocks.chainB.toLocaleString()}</div>
                </div>
                <div className="text-center p-2 bg-purple-100 rounded-lg border border-purple-200">
                  <div className="text-xs text-purple-700">Total</div>
                  <div className="text-lg font-bold text-purple-700">${totalUnlocks.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimal Route Card - Light Theme */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <span className="text-slate-900">Optimal Route (via LiFi)</span>
            <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700 border-blue-300">
              Recommended
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Route Overview */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="text-center px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-600 mb-1">From</div>
                <div className="font-semibold text-slate-900">{route.fromChain}</div>
              </div>
              
              <ArrowRight className="h-5 w-5 text-cyan-600" />
              
              <div className="text-center px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-600 mb-1">To</div>
                <div className="font-semibold text-slate-900">{route.toChain}</div>
              </div>
            </div>
            
            <div className="text-right px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-600 mb-1">Amount</div>
              <div className="text-2xl font-bold text-cyan-600">
                ${route.amount.toLocaleString()} USDC
              </div>
            </div>
          </div>

          {/* Route Details */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 text-blue-600 text-xs mb-1 font-medium">
                <DollarSign className="h-3 w-3" />
                Est. Cost
              </div>
              <div className="text-xl font-semibold text-slate-900">
                ${route.estimatedCost.toFixed(2)}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 text-cyan-600 text-xs mb-1 font-medium">
                <Clock className="h-3 w-3" />
                Est. Time
              </div>
              <div className="text-xl font-semibold text-slate-900">
                ~{route.estimatedTime}s
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 text-green-600 text-xs mb-1 font-medium">
                <Shield className="h-3 w-3" />
                Protocol
              </div>
              <div className="text-xl font-semibold text-slate-900 truncate">
                {route.protocol}
              </div>
            </div>
          </div>

          {/* Route Steps */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-slate-700 mb-2">Route Steps:</div>
            {route.steps.map((step, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-all"
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-bold border border-blue-200">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-900 font-medium">{step.action}</div>
                  <div className="text-xs text-blue-600">via {step.protocol}</div>
                </div>
                <div className="text-xs text-cyan-600 font-medium">{step.estimate}</div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              onClick={onExecute}
              disabled={isExecuting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {isExecuting ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-pulse" />
                  Executing Rebalance...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Begin Rebalance
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50 transition-all"
              onClick={() => window.open('https://li.fi', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on LiFi
            </Button>
          </div>

          {/* Info Notice */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-xs text-blue-700">
              💡 Route optimized by <strong className="text-cyan-700">LiFi</strong> for best cost-efficiency and speed. 
              This route is automatically selected from multiple bridge providers.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
