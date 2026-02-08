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
      case 'yield_max': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'cost_min': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'balanced': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
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
    <Card className="bg-gradient-to-br from-indigo-950/50 to-purple-950/50 border-indigo-500/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-400" />
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
          <code className="text-indigo-400 font-mono bg-black/30 px-2 py-1 rounded">
            {ensName}
          </code>
          {!isError && !parseError ? (
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-400" />
          )}
        </div>

        {!configData && !isLoading && (
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
            Demo Mode: Using Mock Configuration
          </Badge>
        )}

        {parseError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
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
            <div className="p-4 rounded-lg bg-black/30 border border-indigo-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Rebalance Threshold</span>
                <Badge variant="outline" className="font-mono">
                  ${parsedConfig.threshold.toLocaleString()}
                </Badge>
              </div>
              <div className="h-2 bg-black/50 rounded-full overflow-hidden">
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
            <div className="p-4 rounded-lg bg-black/30 border border-indigo-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Active Strategy</span>
                <Badge className={getStrategyColor(parsedConfig.strategy)}>
                  {parsedConfig.strategy.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {getStrategyDescription(parsedConfig.strategy)}
              </p>
            </div>

            {/* Relay Fee */}
            <div className="p-4 rounded-lg bg-black/30 border border-indigo-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Relay Fee</span>
                <Badge variant="outline" className="font-mono">
                  {(parsedConfig.relay_fee * 100).toFixed(2)}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Fee charged for cross-chain rebalancing operations
              </p>
            </div>
          </motion.div>
        )}

        <div className="pt-2 border-t border-indigo-500/30">
          <p className="text-xs text-muted-foreground">
            ⚡ Configuration stored on-chain via ENS • Updates apply instantly without redeployment
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
