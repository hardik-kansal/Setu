'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEnsText, useAccount, useEnsName } from 'wagmi';
import { normalize } from 'viem/ens';
import { RefreshCw, Settings, CheckCircle2, AlertCircle, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { sepolia } from 'wagmi/chains';

interface AIParams {
  threshold: number;
  strategy: string;
  relay_fee: number;
}

export function ENSConfigResolver() {
  const [parsedConfig, setParsedConfig] = useState<AIParams | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  
  const { address, isConnected } = useAccount();
  
  // Get ENS name for the connected address
  const { data: ensName, isLoading: isLoadingEns } = useEnsName({
    address: address,
    chainId: sepolia.id,
  });

  // Fetch ENS text record only if user has an ENS name
  const { data: configData, isLoading: isLoadingConfig, isError, refetch } = useEnsText({
    name: ensName ? normalize(ensName) : undefined,
    key: 'org.setu.ai_params',
    chainId: sepolia.id,
    query: {
      enabled: !!ensName,
    },
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
    } else {
      setParsedConfig(null);
    }
  }, [configData]);

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

  const isLoading = isLoadingEns || isLoadingConfig;

  // Show wallet connection prompt if not connected
  if (!isConnected) {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-600" />
            <span>Decentralized Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Wallet className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Connect Your Wallet</h3>
            <p className="text-sm text-muted-foreground">
              Please connect your wallet to view your ENS configuration
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show ENS setup prompt if user doesn't have an ENS name
  if (!isLoadingEns && !ensName) {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-600" />
            <span>Decentralized Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No ENS Name Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your wallet address doesn't have an ENS name configured on Sepolia.
            </p>
            <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200 max-w-md">
              <p className="font-semibold mb-2">To use ENS configuration:</p>
              <ol className="text-left space-y-1 list-decimal list-inside">
                <li>Register an ENS name on Sepolia</li>
                <li>Set the text record key: <code className="text-xs bg-slate-200 px-1 rounded">org.setu.ai_params</code></li>
                <li>Add your configuration in JSON format</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show configuration not set prompt
  if (!isLoading && ensName && !configData && !isError) {
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
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">ENS Name:</span>
            <code className="text-indigo-600 font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200">
              {ensName}
            </code>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>

          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Configuration Not Set</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No configuration found in your ENS text records.
            </p>
            <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200 max-w-md">
              <p className="font-semibold mb-2">Set your configuration:</p>
              <p className="text-left mb-2">Add a text record to <strong>{ensName}</strong>:</p>
              <div className="bg-white p-2 rounded border border-slate-300 mb-2">
                <p><strong>Key:</strong> <code className="text-xs">org.setu.ai_params</code></p>
              </div>
              <div className="bg-white p-2 rounded border border-slate-300">
                <p><strong>Value:</strong></p>
                <pre className="text-xs text-left mt-1 overflow-x-auto">
{`{
  "threshold": 1000,
  "strategy": "yield_max",
  "relay_fee": 0.005
}`}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
        </div>

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
