'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, DollarSign, Zap, Shield, ExternalLink } from 'lucide-react';
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

interface OptimalRouteDisplayProps {
  route: LiFiRoute | null;
  onExecute?: () => void;
  isExecuting?: boolean;
}

export function OptimalRouteDisplay({ 
  route, 
  onExecute,
  isExecuting = false 
}: OptimalRouteDisplayProps) {
  if (!route) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-gradient-to-br from-blue-950 to-slate-900 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-400" />
            <span className="text-blue-400">Optimal Route Found (via LiFi)</span>
            <Badge variant="outline" className="ml-auto bg-blue-500/20 text-blue-300 border-blue-500/50">
              Recommended
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Route Overview */}
          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xs text-slate-400 mb-1">From</div>
                <div className="font-semibold text-white">{route.fromChain}</div>
              </div>
              
              <ArrowRight className="h-5 w-5 text-blue-400" />
              
              <div className="text-center">
                <div className="text-xs text-slate-400 mb-1">To</div>
                <div className="font-semibold text-white">{route.toChain}</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-slate-400 mb-1">Amount</div>
              <div className="text-xl font-bold text-blue-400">
                ${route.amount.toLocaleString()} USDC
              </div>
            </div>
          </div>

          {/* Route Details */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <DollarSign className="h-3 w-3" />
                Est. Cost
              </div>
              <div className="text-lg font-semibold text-white">
                ${route.estimatedCost.toFixed(2)}
              </div>
            </div>

            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Clock className="h-3 w-3" />
                Est. Time
              </div>
              <div className="text-lg font-semibold text-white">
                ~{route.estimatedTime}s
              </div>
            </div>

            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Shield className="h-3 w-3" />
                Protocol
              </div>
              <div className="text-lg font-semibold text-white">
                {route.protocol}
              </div>
            </div>
          </div>

          {/* Route Steps */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-slate-300 mb-2">Route Steps:</div>
            {route.steps.map((step, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg border border-slate-700/50"
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-white">{step.action}</div>
                  <div className="text-xs text-slate-400">via {step.protocol}</div>
                </div>
                <div className="text-xs text-slate-400">{step.estimate}</div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              onClick={onExecute}
              disabled={isExecuting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold"
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
              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
              onClick={() => window.open('https://li.fi', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on LiFi
            </Button>
          </div>

          {/* Info Notice */}
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-xs text-blue-400/80">
              💡 Route optimized by <strong>LiFi</strong> for best cost-efficiency and speed. 
              This route is automatically selected from multiple bridge providers.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
