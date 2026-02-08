'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { useEnsText } from 'wagmi';
import { normalize } from 'viem/ens';
import { sepolia } from 'wagmi/chains';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'success' | 'analysis';
  message: string;
  icon?: React.ReactNode;
}

interface ElizaReasoningFeedProps {
  ensName?: string;
  currentImbalance?: number;
}

export function ElizaReasoningFeed({ 
  ensName = 'setu-vault.eth',
  currentImbalance = 1200 
}: ElizaReasoningFeedProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  const { data: configData } = useEnsText({
    name: normalize(ensName),
    key: 'org.setu.ai_params',
    chainId: sepolia.id,
  });

  useEffect(() => {
    // Auto-scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    // Simulate ElizaOS reasoning when component mounts or config changes
    simulateElizaReasoning();
  }, [configData]);

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

  const simulateElizaReasoning = async () => {
    setIsProcessing(true);
    setLogs([]); // Clear previous logs

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Parse config or use defaults
    let threshold = 1000;
    let strategy = 'yield_max';
    
    if (configData) {
      try {
        const parsed = JSON.parse(configData);
        threshold = parsed.threshold;
        strategy = parsed.strategy;
      } catch (e) {
        // Use defaults
      }
    }

    // Simulate ElizaOS reasoning process
    await delay(500);
    addLog('info', `🤖 ElizaOS Agent initialized...`, <Brain className="h-4 w-4" />);
    
    await delay(800);
    addLog('analysis', `📡 Fetching ENS configuration from ${ensName}...`);
    
    await delay(1000);
    addLog('success', `✅ ENS record retrieved: org.setu.ai_params`);
    
    await delay(700);
    addLog('info', `🔍 Parsing governance parameters...`);
    
    await delay(900);
    addLog('success', `✅ Threshold detected: $${threshold.toLocaleString()}`);
    addLog('success', `✅ Strategy: ${strategy.replace('_', ' ').toUpperCase()}`);
    
    await delay(1200);
    addLog('analysis', `📊 Analyzing current system state...`);
    
    await delay(800);
    addLog('info', `💰 L1 (Sepolia) Balance: $15,234 USDC`);
    addLog('info', `💰 L2 (Base Sepolia) Balance: $13,034 USDC`);
    
    await delay(1000);
    addLog('warning', `⚡ Current Imbalance: $${currentImbalance.toLocaleString()}`, <AlertTriangle className="h-4 w-4" />);
    
    await delay(1200);
    if (currentImbalance > threshold) {
      addLog('warning', `⚠️ THRESHOLD BREACHED: $${currentImbalance} > $${threshold}`);
      
      await delay(800);
      addLog('analysis', `🧠 Reasoning: ENS governance dictates an immediate rebalance`);
      
      await delay(1000);
      addLog('analysis', `🎯 Strategy: ${strategy === 'yield_max' ? 'Prioritizing highest yield chain' : strategy === 'cost_min' ? 'Minimizing gas costs' : 'Balanced approach'}`);
      
      await delay(800);
      addLog('info', `🔄 Querying LI.FI for optimal cross-chain routes...`);
      
      await delay(1500);
      addLog('success', `✅ Route found: Sepolia → Base Sepolia via Stargate`);
      addLog('success', `✅ Estimated cost: $2.45 | Time: ~45 seconds`);
      
      await delay(1000);
      addLog('success', `🚀 Rebalance action prepared and ready for execution`, <TrendingUp className="h-4 w-4" />);
    } else {
      await delay(800);
      addLog('success', `✅ System within acceptable parameters`);
      
      await delay(600);
      addLog('info', `💡 No immediate action required`);
      
      await delay(500);
      addLog('analysis', `🧠 Reasoning: Imbalance ($${currentImbalance}) below threshold ($${threshold})`);
    }
    
    await delay(1000);
    addLog('info', `⏰ Next analysis scheduled in 5 minutes...`);
    
    setIsProcessing(false);
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-emerald-400';
      case 'warning': return 'text-yellow-400';
      case 'analysis': return 'text-cyan-400';
      default: return 'text-green-400';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-950 to-slate-900 border-emerald-500/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-emerald-400" />
            <span className="font-mono text-emerald-400">ElizaOS Reasoning Feed</span>
          </div>
          {isProcessing && (
            <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 animate-pulse">
              <Zap className="h-3 w-3 mr-1" />
              Processing
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={terminalRef}
          className="h-[500px] overflow-y-auto bg-black rounded-lg p-4 space-y-2 font-mono text-sm scrollbar-thin scrollbar-thumb-emerald-500/50 scrollbar-track-slate-800"
        >
          <AnimatePresence>
            {logs.length === 0 ? (
              <div className="flex items-center gap-2 text-slate-500">
                <span className="animate-pulse">▶</span>
                <span>Initializing ElizaOS agent...</span>
              </div>
            ) : (
              logs.map((log, index) => (
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
        
        <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
          <p className="text-xs text-emerald-400/80">
            💡 <strong>ElizaOS</strong> uses ENS as its configuration layer. Changes to ENS text records 
            instantly update the AI's decision-making logic without any code redeployment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
