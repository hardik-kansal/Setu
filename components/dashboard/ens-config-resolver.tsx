'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEnsText } from 'wagmi';
import { normalize } from 'viem/ens';
import { RefreshCw, Settings, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { sepolia } from 'wagmi/chains';

interface AIParams {
  threshold: number;
  strategy: string;
  relay_fee: number;
}

interface ENSConfigResolverProps {
  ensName?: string;
}

export function ENSConfigResolver({ ensName = 'setu-vault.eth' }: ENSConfigResolverProps) {
  const [parsedConfig, setParsedConfig] = useState<AIParams | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // Fetch ENS text record
  const { data: configData, isLoading, isError, refetch } = useEnsText({
    name: normalize(ensName),
    key: 'org.setu.ai_params',
    chainId: sepolia.id,
  });

  useEffect(() => {
    if (configData) {
      try {
        const parsed = JSON.parse(configData);
        setParsedConfig(parsed);
        setParseError(null);
      } catch (error) {
        setParseError('Invalid JSON in ENS record');
        setParsedConfig(null);
      }
    } else if (!isLoading && !configData) {
      // Mock data for demo when ENS record not set
      setParsedConfig({
        threshold: 1000,
        strategy: 'yield_max',
        relay_fee: 0.005,
      });
    }
  }, [configData, isLoading]);

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'yield_max': return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'cost_min': return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'balanced': return 'bg-purple-50 text-purple-700 border-purple-300';
      default: return 'bg-slate-50 text-slate-700 border-slate-300';
    }
  };

  const getStrategyDescription = (strategy: string) => {
    switch (strategy) {
      case 'yield_max': return 'Maximize yield opportunities across chains';
      case 'cost_min': return 'Minimize transaction costs and gas fees';
      case 'balanced': return 'Balance between yield and cost efficiency';
      default: return 'Custom strategy';
    }
  };

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-600" />
            <span>Decentralized Settings</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">ENS Name:</span>
          <code className="text-indigo-600 font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200">
            {ensName}
          </code>
          {!isError && !parseError ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          )}
        </div>

        {!configData && !isLoading && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            Demo Mode: Using Mock Configuration
          </Badge>
        )}

        {parseError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {parseError}
          </div>
        )}

        {parsedConfig && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Threshold */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Rebalance Threshold</span>
                <Badge variant="outline" className="font-mono bg-white">
                  ${parsedConfig.threshold.toLocaleString()}
                </Badge>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                AI triggers rebalancing when imbalance exceeds this threshold
              </p>
            </div>

            {/* Strategy */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Active Strategy</span>
                <Badge className={getStrategyColor(parsedConfig.strategy)}>
                  {parsedConfig.strategy.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {getStrategyDescription(parsedConfig.strategy)}
              </p>
            </div>

            {/* Relay Fee */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Relay Fee</span>
                <Badge variant="outline" className="font-mono bg-white">
                  {(parsedConfig.relay_fee * 100).toFixed(2)}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Fee charged for cross-chain rebalancing operations
              </p>
            </div>
          </motion.div>
        )}

        <div className="pt-2 border-t border-slate-200">
          <p className="text-xs text-slate-600">
            ⚡ Configuration stored on-chain via ENS • Updates apply instantly without redeployment
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
