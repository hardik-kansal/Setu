'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsOverview, RebalanceActionCard } from '@/components/dashboard/rebalancer-stats';
import { RebalanceHistory } from '@/components/dashboard/rebalance-history';
import { UserProfile } from '@/components/dashboard/user-profile';
import { SetuAgentReasoningFeed } from '@/components/dashboard/eliza-reasoning-feed';
import { ENSConfigResolver } from '@/components/dashboard/ens-config-resolver';
import { rebalancerAgent } from '@/lib/rebalancer-agent';
import { getRecentAIReasoningLogs, getRebalanceHistory, type AIReasoningLog, type RebalanceAction } from '@/lib/supabase';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { RefreshCw, Loader2 } from 'lucide-react';
import type { Route } from '@lifi/sdk';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function RebalancerDashboard() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [latestReasoning, setLatestReasoning] = useState<AIReasoningLog | null>(null);
  const [rebalanceHistory, setRebalanceHistory] = useState<RebalanceAction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

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
          <h1 className="text-4xl font-bold text-slate-900">🤖 AI Rebalancer</h1>
          <p className="text-muted-foreground mt-2">
            AI-Powered Cross-Chain Liquidity Management
          </p>
        </div>
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

      {/* User Profile, Setu-Agent Feed, and ENS Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <UserProfile />
          <ENSConfigResolver />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <SetuAgentReasoningFeed />
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
          <Card className="bg-white border-slate-200">
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

        <RebalanceHistory />
      </div>
    </div>
  );
}
