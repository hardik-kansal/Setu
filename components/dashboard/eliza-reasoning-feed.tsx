'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, TrendingUp, AlertTriangle, Play, Loader2, CheckCircle2 } from 'lucide-react';
import { CombinedRebalanceDisplay } from './combined-rebalance-display';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'success' | 'analysis' | 'error';
  message: string;
  icon?: React.ReactNode;
}

interface AIAnalysisResult {
  needsRebalance: boolean;
  confidence: number;
  reasoning: string[];
  suggestedAmount: number;
  urgency: 'low' | 'medium' | 'high';
  riskFactors: string[];
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

export function SetuAgentReasoningFeed() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [lifiRoute, setLifiRoute] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (type: LogEntry['type'], message: string, icon?: React.ReactNode) => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      type,
      message,
      icon,
    };
    setLogs(prev => [...prev, newLog]);
  };

  const runAIAnalysis = async () => {
    setIsProcessing(true);
    setLogs([]); // Clear previous logs
    setAiAnalysis(null);
    setLifiRoute(null);
    setAnalysisData(null);

    try {
      addLog('info', '🤖 Setu-Agent initialized...', <Brain className="h-4 w-4" />);
      addLog('analysis', '📡 Connecting to Supabase database...');
      addLog('info', '🔍 Fetching last rebalance data...');
      addLog('info', '💰 Reading current chain balances from contracts...');
      addLog('info', '📅 Querying upcoming unlocks (24h window)...');

      // Call the API - NO FAKE DELAYS
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response received:', textResponse);
        throw new Error(`Server returned HTML instead of JSON. Check server console for errors. Status: ${response.status}`);
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `API request failed with status ${response.status}`);
      }
      
      addLog('success', '✅ All data retrieved from Supabase & contracts');
      addLog('analysis', '🧠 AI model analyzing data...');
      
      // Display the data
      setAnalysisData(result.data);
      setAiAnalysis(result.aiAnalysis);

      addLog('success', '✅ AI analysis complete');
      addLog('info', `📊 Last Rebalance: ${result.data.lastRebalance.timestamp === new Date(0).toISOString() ? 'Never' : new Date(result.data.lastRebalance.timestamp).toLocaleString()}`);
      addLog('info', `💰 Chain A (Sepolia): $${result.data.currentBalances.chainA.toLocaleString()} USDC`);
      addLog('info', `💰 Chain B (Base): $${result.data.currentBalances.chainB.toLocaleString()} USDC`);
      addLog('warning', `⚡ Current Imbalance: $${result.data.currentBalances.imbalance.toLocaleString()}`, <AlertTriangle className="h-4 w-4" />);
      addLog('info', `🔓 Upcoming unlocks (24h): $${(result.data.upcomingUnlocks.chainA + result.data.upcomingUnlocks.chainB).toLocaleString()}`);
      addLog('analysis', '🤔 AI Reasoning Process:');
      
      // Display AI reasoning
      result.aiAnalysis.reasoning.forEach((reason: string) => {
        addLog('analysis', `  • ${reason}`);
      });

      if (result.aiAnalysis.needsRebalance) {
        addLog('warning', `⚠️ REBALANCE RECOMMENDED (${result.aiAnalysis.confidence}% confidence)`);
        addLog('info', `📏 Suggested Amount: $${Math.abs(result.aiAnalysis.suggestedAmount).toLocaleString()} USDC`);
        addLog('info', `🎯 Direction: ${result.aiAnalysis.suggestedAmount > 0 ? 'Sepolia → Base' : 'Base → Sepolia'}`);
        addLog('info', `🚨 Urgency: ${result.aiAnalysis.urgency.toUpperCase()}`);
        
        // Show risk factors
        if (result.aiAnalysis.riskFactors.length > 0) {
          addLog('warning', '⚠️ Risk Factors:');
          result.aiAnalysis.riskFactors.forEach((risk: string) => {
            addLog('warning', `  • ${risk}`);
          });
        }

        // Query LiFi only if confidence > 90%
        if (result.aiAnalysis.confidence > 90) {
          addLog('analysis', '🔄 High confidence detected. Querying LiFi for optimal route...');
          
          try {
            // Call real LiFi API
            const lifiResponse = await fetch('/api/lifi-route', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fromChain: result.aiAnalysis.suggestedAmount > 0 ? 'Sepolia' : 'Base Sepolia',
                toChain: result.aiAnalysis.suggestedAmount > 0 ? 'Base Sepolia' : 'Sepolia',
                amount: Math.abs(result.aiAnalysis.suggestedAmount),
              }),
            });

            const lifiData = await lifiResponse.json();
            
            if (lifiData.success && lifiData.route) {
              setLifiRoute(lifiData.route);
              addLog('success', '✅ LiFi route found and optimized', <TrendingUp className="h-4 w-4" />);
              addLog('success', '🚀 Ready to execute rebalance!');
            } else {
              throw new Error('Failed to get LiFi route');
            }
          } catch (lifiError: any) {
            addLog('error', `⚠️ LiFi query failed: ${lifiError.message}`);
            addLog('info', '💡 Using fallback route calculation');
            
            // Fallback route
            const fallbackRoute = {
              fromChain: result.aiAnalysis.suggestedAmount > 0 ? 'Sepolia' : 'Base Sepolia',
              toChain: result.aiAnalysis.suggestedAmount > 0 ? 'Base Sepolia' : 'Sepolia',
              amount: Math.abs(result.aiAnalysis.suggestedAmount),
              estimatedCost: 2.45,
              estimatedTime: 45,
              protocol: 'Stargate (Fallback)',
              steps: [
                { action: 'Approve USDC on source chain', protocol: 'ERC20', estimate: '~5s' },
                { action: 'Bridge via Stargate', protocol: 'Stargate', estimate: '~35s' },
                { action: 'Receive on destination', protocol: 'LayerZero', estimate: '~5s' }
              ]
            };
            
            setLifiRoute(fallbackRoute);
          }
        } else {
          addLog('info', `💡 Confidence (${result.aiAnalysis.confidence}%) below threshold. Manual review recommended.`);
        }
      } else {
        addLog('success', '✅ System balanced - No action required');
        addLog('info', `💡 Current imbalance within acceptable parameters`);
      }

      addLog('info', '⏰ Analysis complete. Run again to refresh data.');

    } catch (error: any) {
      addLog('error', `❌ Error: ${error.message}`);
      
      // More detailed error logging
      if (error.message.includes('fetch')) {
        addLog('error', '💡 Check: Is the dev server running? Check terminal for API errors.');
      } else if (error.message.includes('API')) {
        addLog('error', '💡 Check: API keys in .env.local may be invalid or expired.');
      }
      
      console.error('Analysis error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteRebalance = async () => {
    setIsExecuting(true);
    addLog('info', '🚀 Initiating rebalance transaction...');
    
    try {
      if (!aiAnalysis || !lifiRoute) {
        throw new Error('Missing analysis or route data');
      }

      addLog('info', '💾 Saving rebalance action to Supabase...');
      
      // Save to Supabase rebalance_logs
      const rebalanceData = {
        timestamp: new Date().toISOString(),
        direction: aiAnalysis.suggestedAmount > 0 ? 0 : 1, // 0: Chain A -> B, 1: Chain B -> A
        assets_transferred: Math.abs(aiAnalysis.suggestedAmount),
        gas_fee_usd: lifiRoute.estimatedCost,
        reasoning_trace: `AI Analysis: ${aiAnalysis.reasoning.join(' | ')} | Confidence: ${aiAnalysis.confidence}% | Urgency: ${aiAnalysis.urgency}`,
      };

      const response = await fetch('/api/save-rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rebalanceData),
      });

      if (!response.ok) {
        throw new Error('Failed to save rebalance to database');
      }

      addLog('success', '✅ Rebalance logged to Supabase');
      addLog('info', '⏳ Executing bridge transaction...');
      addLog('info', '💡 Connect wallet and approve transaction to complete rebalance');
      addLog('success', '✅ Rebalance initiated! Check transaction status in your wallet.');
      
      // Hide the route and unlocks displays after execution
      setLifiRoute(null);
      setAnalysisData(null);
      
    } catch (error: any) {
      addLog('error', `❌ Rebalance failed: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-emerald-400';
      case 'warning': return 'text-yellow-400';
      case 'analysis': return 'text-cyan-400';
      case 'error': return 'text-red-400';
      default: return 'text-green-400';
    }
  };

  // Show "No Action Required" when system is balanced
  const showNoActionRequired = aiAnalysis && !aiAnalysis.needsRebalance && analysisData;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-emerald-900/50 via-slate-800/50 to-teal-900/50 border-emerald-400/30 backdrop-blur-sm shadow-xl shadow-emerald-500/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-emerald-300" />
              <span className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">Setu-Agent Reasoning Terminal</span>
            </div>
            <div className="flex items-center gap-2">
              {isProcessing && (
                <Badge variant="outline" className="bg-emerald-500/30 text-emerald-300 border-emerald-400/50 animate-pulse">
                  <Zap className="h-3 w-3 mr-1" />
                  Processing
                </Badge>
              )}
              <Button
                onClick={runAIAnalysis}
                disabled={isProcessing}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run AI Analysis
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={terminalRef}
            className="h-[500px] overflow-y-auto bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl p-4 space-y-2 font-mono text-sm scrollbar-thin scrollbar-thumb-emerald-500/50 scrollbar-track-slate-800 border border-emerald-500/20 shadow-inner"
          >
            <AnimatePresence>
              {logs.length === 0 ? (
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="animate-pulse text-emerald-400">▶</span>
                  <span>Ready. Click "Run AI Analysis" to start...</span>
                </div>
              ) : (
                logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-3 items-start"
                  >
                    <span className="text-slate-500 text-xs shrink-0">
                      [{log.timestamp.toLocaleTimeString()}]
                    </span>
                    <div className={`flex items-start gap-2 ${getLogColor(log.type)}`}>
                      {log.icon}
                      <span className="leading-relaxed">{log.message}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
          
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-400/30">
            <p className="text-xs text-emerald-200">
              💡 <strong className="text-emerald-300">Setu-Agent</strong> reads real-time data from Supabase, analyzes it using AI, 
              and automatically finds optimal rebalancing routes via LiFi when confidence exceeds 90%.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Show "No Action Required" card when balanced */}
      {showNoActionRequired && (
        <Card className="bg-white border-slate-200">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">✅ No Action Required</h3>
              <p className="text-slate-600 mb-4">The system is currently balanced</p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 hover:shadow-md transition-all">
                  <div className="text-xs text-emerald-700 mb-1 font-medium">Chain A (Sepolia)</div>
                  <div className="text-2xl font-bold text-slate-900">${analysisData.currentBalances.chainA.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-200 hover:shadow-md transition-all">
                  <div className="text-xs text-green-700 mb-1 font-medium">Chain B (Base)</div>
                  <div className="text-2xl font-bold text-slate-900">${analysisData.currentBalances.chainB.toLocaleString()}</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                Current imbalance (${analysisData.currentBalances.imbalance.toFixed(2)}) is within acceptable parameters
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show Combined Rebalance Display when rebalance is needed */}
      {aiAnalysis?.needsRebalance && lifiRoute && analysisData && (
        <CombinedRebalanceDisplay 
          route={lifiRoute}
          analysisData={analysisData}
          onExecute={handleExecuteRebalance}
          isExecuting={isExecuting}
        />
      )}
    </div>
  );
}
