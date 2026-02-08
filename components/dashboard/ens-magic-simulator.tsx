'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Sparkles, Zap, ArrowRight, CheckCircle2, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface SimulationStep {
  id: number;
  status: 'pending' | 'active' | 'complete';
  title: string;
  description: string;
}

export function ENSMagicSimulator() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentConfig, setCurrentConfig] = useState({
    threshold: 1000,
    strategy: 'yield_max',
    relay_fee: 0.005,
  });
  const [newConfig, setNewConfig] = useState({
    threshold: 500,
    strategy: 'cost_min',
    relay_fee: 0.003,
  });
  const [simulationSteps, setSimulationSteps] = useState<SimulationStep[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const steps: SimulationStep[] = [
    {
      id: 1,
      status: 'pending',
      title: 'ENS Text Record Update',
      description: 'Updating org.setu.ai_params on setu-vault.eth',
    },
    {
      id: 2,
      status: 'pending',
      title: 'Transaction Confirmed',
      description: 'On-chain update confirmed on Ethereum Sepolia',
    },
    {
      id: 3,
      status: 'pending',
      title: 'ElizaOS Detection',
      description: 'AI agent detects configuration change',
    },
    {
      id: 4,
      status: 'pending',
      title: 'Strategy Recomputation',
      description: 'Rebalancing logic updated with new parameters',
    },
    {
      id: 5,
      status: 'pending',
      title: 'Live Update Complete',
      description: 'System now operating with new configuration',
    },
  ];

  const runSimulation = async () => {
    setIsSimulating(true);
    setSimulationSteps(steps);
    setShowComparison(true);

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < steps.length; i++) {
      await delay(1200);
      
      setSimulationSteps(prev => 
        prev.map((step, idx) => ({
          ...step,
          status: idx < i ? 'complete' : idx === i ? 'active' : 'pending',
        }))
      );

      if (i === 0) {
        toast.info('📝 ENS text record updated');
      } else if (i === 2) {
        toast.success('🤖 ElizaOS detected changes');
      } else if (i === 4) {
        toast.success('✨ Configuration updated live!');
      }
    }

    await delay(800);
    setSimulationSteps(prev => 
      prev.map(step => ({ ...step, status: 'complete' as const }))
    );

    setCurrentConfig(newConfig);
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    setSimulationSteps([]);
    setShowComparison(false);
    setNewConfig({
      threshold: 500,
      strategy: 'cost_min',
      relay_fee: 0.003,
    });
  };

  return (
    <Card className="bg-gradient-to-br from-fuchsia-950/30 to-pink-950/30 border-fuchsia-500/30 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/5 to-pink-500/5 animate-pulse" />
      
      <CardHeader>
        <CardTitle className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-fuchsia-400" />
            <span>The Magic Feature ✨</span>
          </div>
          <Badge className="bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/50">
            Zero Downtime
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 relative z-10">
        <div className="p-4 rounded-lg bg-gradient-to-r from-fuchsia-500/10 to-pink-500/10 border border-fuchsia-500/30">
          <p className="text-sm leading-relaxed">
            <strong className="text-fuchsia-400">The Magic:</strong> Update your ENS text record, 
            and watch ElizaOS instantly change its bridge strategy without redeploying a single 
            line of code. This is the power of decentralized configuration.
          </p>
        </div>

        {!showComparison ? (
          <div className="text-center py-6">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Simulate ENS Update
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl bg-slate-950 border-fuchsia-500/30">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-fuchsia-400" />
                    Configure New ENS Parameters
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="threshold">Rebalance Threshold ($USD)</Label>
                      <Input
                        id="threshold"
                        type="number"
                        value={newConfig.threshold}
                        onChange={(e) => setNewConfig({ ...newConfig, threshold: Number(e.target.value) })}
                        className="bg-black/50 border-fuchsia-500/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="strategy">Strategy</Label>
                      <Select
                        value={newConfig.strategy}
                        onValueChange={(value) => setNewConfig({ ...newConfig, strategy: value })}
                      >
                        <SelectTrigger className="bg-black/50 border-fuchsia-500/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yield_max">Yield Maximization</SelectItem>
                          <SelectItem value="cost_min">Cost Minimization</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="relay_fee">Relay Fee (%)</Label>
                      <Input
                        id="relay_fee"
                        type="number"
                        step="0.001"
                        value={newConfig.relay_fee}
                        onChange={(e) => setNewConfig({ ...newConfig, relay_fee: Number(e.target.value) })}
                        className="bg-black/50 border-fuchsia-500/30"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => {
                        runSimulation();
                        setIsOpen(false);
                      }}
                      className="flex-1 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Run Simulation
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      className="border-fuchsia-500/30"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Before/After Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-black/30 border border-slate-500/30">
                <h4 className="text-sm font-semibold mb-3 text-slate-400">Before</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Threshold:</span>
                    <span>${currentConfig.threshold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Strategy:</span>
                    <span className="uppercase">{currentConfig.strategy.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee:</span>
                    <span>{(currentConfig.relay_fee * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/30">
                <h4 className="text-sm font-semibold mb-3 text-fuchsia-400">After</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Threshold:</span>
                    <span className="text-fuchsia-400">${newConfig.threshold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Strategy:</span>
                    <span className="text-fuchsia-400 uppercase">{newConfig.strategy.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee:</span>
                    <span className="text-fuchsia-400">{(newConfig.relay_fee * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulation Steps */}
            <div className="space-y-2">
              <AnimatePresence>
                {simulationSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border flex items-start gap-3 ${
                      step.status === 'complete'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : step.status === 'active'
                        ? 'bg-fuchsia-500/10 border-fuchsia-500/30'
                        : 'bg-black/20 border-slate-500/20'
                    }`}
                  >
                    <div className="mt-1">
                      {step.status === 'complete' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : step.status === 'active' ? (
                        <Zap className="h-4 w-4 text-fuchsia-400 animate-pulse" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-slate-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {!isSimulating && simulationSteps.every(s => s.status === 'complete') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <h4 className="font-semibold text-emerald-400">✨ Magic Complete!</h4>
                </div>
                <p className="text-sm text-emerald-400/80">
                  ElizaOS is now using the new configuration. No code deployment. No downtime. 
                  Just pure decentralized governance magic.
                </p>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={resetSimulation}
                    className="border-emerald-500/30 text-emerald-400"
                  >
                    Reset Simulation
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        <div className="flex items-start gap-2 p-3 rounded-lg bg-black/30 border border-fuchsia-500/20 text-xs">
          <Code2 className="h-4 w-4 text-fuchsia-400 shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            <strong className="text-fuchsia-400">Technical:</strong> ENS acts as a decentralized 
            key-value store. Your AI reads configuration from blockchain, eliminating the need 
            for centralized config servers or redeployments.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
