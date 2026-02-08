'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatsOverview, RebalanceActionCard } from '@/components/dashboard/rebalancer-stats';
import { RebalanceHistory } from '@/components/dashboard/rebalance-history';
import { UserProfile } from '@/components/dashboard/user-profile';
import { ElizaReasoningFeed } from '@/components/dashboard/eliza-reasoning-feed';
import { ENSConfigResolver } from '@/components/dashboard/ens-config-resolver';
import { rebalancerAgent } from '@/lib/rebalancer-agent';
import { getRecentAIReasoningLogs, getRebalanceHistory, type AIReasoningLog, type RebalanceAction } from '@/lib/supabase';
import { useAccount, useWalletClient, useEnsName } from 'wagmi';
import { ethers } from 'ethers';
import { RefreshCw, Loader2, Settings } from 'lucide-react';
import type { Route } from '@lifi/sdk';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { mainnet } from 'wagmi/chains';

export function RebalancerDashboard() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  // Fetch ENS name for connected address
  const { data: userEnsName } = useEnsName({
    address: address,
    chainId: mainnet.id,
  });
  
  const [latestReasoning, setLatestReasoning] = useState<AIReasoningLog | null>(null);
  const [rebalanceHistory, setRebalanceHistory] = useState<RebalanceAction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [ensName, setEnsName] = useState('sleepinghoodie.eth');
  const [tempEnsName, setTempEnsName] = useState('sleepinghoodie.eth');
  const [showSettings, setShowSettings] = useState(false);

  // Update ENS name when user's ENS is fetched
  useEffect(() => {
    if (userEnsName) {
      setEnsName(userEnsName);
      setTempEnsName(userEnsName);
    }
  }, [userEnsName]);

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadDashboardData();
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [reasoningLogs, history] = await Promise.all([
        getRecentAIReasoningLogs(1),
        getRebalanceHistory(10),
      ]);

      if (reasoningLogs.length > 0) {
        setLatestReasoning(reasoningLogs[0]);
      } else {
        setLatestReasoning(createMockReasoning());
      }
      setRebalanceHistory(history);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLatestReasoning(createMockReasoning());
    }
  };

  const createMockReasoning = (): AIReasoningLog => ({
    id: 'mock-1',
    analysis_timestamp: new Date().toISOString(),
    l1_interest_earned: '1234567', // 1.234567 USDC
    l2_interest_earned: '987654', // 0.987654 USDC
    net_transfer_l1_to_l2: '5000000', // 5 USDC
    net_debt: '2500000', // 2.5 USDC
    debtor_chain_id: 11155111,
    upcoming_unlocks_24h: [
      { chain_id: 11155111, amount: '1000000', unlock_time: new Date(Date.now() + 3600000).toISOString() },
      { chain_id: 84532, amount: '1500000', unlock_time: new Date(Date.now() + 7200000).toISOString() },
    ],
    suggested_rebalance_amount: '0',
    suggested_route: null,
    reasoning_trace: {
      thoughts: [
        '📊 Mock data: Analyzing system state...',
        '💡 System appears balanced with current liquidity levels',
        '✅ No immediate rebalancing required'
      ],
      confidence_factors: {
        data_freshness: true,
        sufficient_liquidity: true,
        cost_efficiency: true,
      },
    },
    confidence_score: 0.85,
    data_sources: {
      l1_snapshot_id: 'mock-l1',
      l2_snapshot_id: 'mock-l2',
      event_ids: [],
    },
  });

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      const reasoning = await rebalancerAgent.calculateOptimalRebalance();
      
      if (reasoning) {
        setLatestReasoning(reasoning);
        toast.success('AI analysis complete!');
      } else {
        toast.info('System is balanced');
      }

      // Reload history
      const history = await getRebalanceHistory(10);
      setRebalanceHistory(history);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const executeRebalance = async (route: Route) => {
    if (!isConnected || !walletClient) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsExecuting(true);
    
    try {
      // Convert walletClient to ethers signer
      const provider = new ethers.BrowserProvider(walletClient as any);
      const signer = await provider.getSigner();

      const txHash = await rebalancerAgent.executeRebalance(route, signer);
      
      toast.success('Rebalance executed successfully!');

      // Reload data
      await loadDashboardData();
    } catch (error) {
      console.error('Execution error:', error);
      toast.error('Rebalance execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Stats Overview at the very top */}
      <StatsOverview reasoning={latestReasoning} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">🤖 AI Rebalancer</h1>
          <p className="text-muted-foreground mt-2">
            AI-Powered Cross-Chain Liquidity Management
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="border-indigo-500/30 text-indigo-400"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure ENS
          </Button>
          <Button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Run AI Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ENS Configuration Card */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="max-w-md"
        >
          <Card className="bg-slate-900/50 border-indigo-500/30">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ens-name">ENS Name (on Sepolia)</Label>
                <Input
                  id="ens-name"
                  value={tempEnsName}
                  onChange={(e) => setTempEnsName(e.target.value)}
                  placeholder="your-name.eth"
                  className="bg-black/50 border-indigo-500/30"
                />
                <p className="text-xs text-muted-foreground">
                  {userEnsName 
                    ? `Your ENS: ${userEnsName} • Configure AI parameters on Sepolia` 
                    : 'This ENS name will be used to fetch AI configuration from Sepolia'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setEnsName(tempEnsName);
                    setShowSettings(false);
                    toast.success('ENS name updated');
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  Apply
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setTempEnsName(ensName);
                    setShowSettings(false);
                  }}
                  className="border-indigo-500/30"
                >
                  Cancel
                </Button>
              </div>
              {userEnsName && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTempEnsName(userEnsName)}
                  className="w-full text-xs"
                >
                  Use My ENS: {userEnsName}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* User Profile, Eliza Feed, and ENS Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <UserProfile />
          <ENSConfigResolver ensName={ensName} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <ElizaReasoningFeed ensName={ensName} />
        </motion.div>
      </div>

      {/* Action Card and History Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {latestReasoning && latestReasoning.suggested_route ? (
          <RebalanceActionCard
            reasoning={latestReasoning}
            onExecute={executeRebalance}
            executing={isExecuting}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>💡 No Action Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                The system is currently balanced. Run an analysis to check for rebalancing opportunities.
              </p>
            </CardContent>
          </Card>
        )}

        <RebalanceHistory history={rebalanceHistory} />
      </div>
    </div>
  );
}
