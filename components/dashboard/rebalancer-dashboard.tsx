'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsOverview, RebalanceActionCard } from '@/components/dashboard/rebalancer-stats';
import { AIReasoningTerminal } from '@/components/dashboard/ai-terminal';
import { RebalanceHistory } from '@/components/dashboard/rebalance-history';
import { rebalancerAgent } from '@/lib/rebalancer-agent';
import { getRecentAIReasoningLogs, getRebalanceHistory, type AIReasoningLog, type RebalanceAction } from '@/lib/supabase';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { RefreshCw, Loader2 } from 'lucide-react';
import type { Route } from '@lifi/sdk';
import { toast } from 'sonner';

export function RebalancerDashboard() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [latestReasoning, setLatestReasoning] = useState<AIReasoningLog | null>(null);
  const [rebalanceHistory, setRebalanceHistory] = useState<RebalanceAction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

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
        // Show mock data if no real data available
        addLog('ℹ️ No data in database. Showing mock stats for demo.');
        setLatestReasoning(createMockReasoning());
      }
      setRebalanceHistory(history);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      addLog('❌ Error loading dashboard data. Using mock data for demo.');
      // Show mock data on error (e.g., Supabase not configured)
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
      { chain_id: 11155111, user: '0x123...', amount: '1000000', unlock_time: new Date(Date.now() + 3600000).toISOString() },
      { chain_id: 84532, user: '0x456...', amount: '1500000', unlock_time: new Date(Date.now() + 7200000).toISOString() },
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

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    addLog('🤖 Starting AI rebalancer analysis...');
    
    try {
      const reasoning = await rebalancerAgent.calculateOptimalRebalance();
      
      if (reasoning) {
        setLatestReasoning(reasoning);
        addLog('✅ Analysis complete! Rebalancing suggestion generated.');
        toast.success('AI analysis complete!');
      } else {
        addLog('✅ Analysis complete. System is balanced, no action needed.');
        toast.info('System is balanced');
      }

      // Reload history
      const history = await getRebalanceHistory(10);
      setRebalanceHistory(history);
    } catch (error) {
      console.error('Analysis error:', error);
      addLog(`❌ Analysis failed: ${error}`);
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
    addLog('🚀 Executing rebalance via LI.FI...');
    
    try {
      // Convert walletClient to ethers signer
      const provider = new ethers.BrowserProvider(walletClient as any);
      const signer = await provider.getSigner();

      const txHash = await rebalancerAgent.executeRebalance(route, signer);
      
      addLog(`✅ Rebalance executed! TX: ${txHash}`);
      toast.success('Rebalance executed successfully!');

      // Reload data
      await loadDashboardData();
    } catch (error) {
      console.error('Execution error:', error);
      addLog(`❌ Execution failed: ${error}`);
      toast.error('Rebalance execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">🤖 Setu Rebalancer Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            AI-Powered Cross-Chain Liquidity Management System
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

      {/* Stats Overview */}
      <StatsOverview reasoning={latestReasoning} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Reasoning Terminal */}
        <AIReasoningTerminal reasoning={latestReasoning} logs={logs} />

        {/* Action Card or History */}
        <div className="space-y-6">
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📊 System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Contract Addresses</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">L1 (Sepolia):</span>
                      <code className="text-xs">0x010a712748b9903c90deec684f433bae57a67476</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">L2 (Base Sepolia):</span>
                      <code className="text-xs">0x8116cFd461C5AB410131Fd6925e6D394F0065Ee2</code>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">How It Works</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>AI monitors liquidity across L1 and L2 chains</li>
                    <li>Calculates interest earned and net transfer flows</li>
                    <li>Identifies liquidity imbalances and upcoming unlock needs</li>
                    <li>Queries LI.FI for optimal cross-chain routes</li>
                    <li>Suggests rebalancing actions with confidence scores</li>
                    <li>Executes rebalancing when approved by operators</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📈 Analytics (Coming Soon)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Charts and analytics will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>⚙️ Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Configuration</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rebalance Threshold:</span>
                      <span>1 USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Safety Buffer:</span>
                      <span>10%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Analysis Interval:</span>
                      <span>5 minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
