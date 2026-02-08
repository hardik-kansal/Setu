'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { ethers } from 'ethers';
import type { Route } from '@lifi/sdk';
import type { AIReasoningLog } from '@/lib/supabase';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  subtitle?: string;
  alert?: boolean;
  icon?: React.ReactNode;
  breakdown?: string;
}

function StatCard({ title, value, change, subtitle, alert, icon, breakdown }: StatCardProps) {
  return (
    <Card className={alert ? 'border-red-500 border-2' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'} flex items-center gap-1 mt-1`}>
            {change.startsWith('+') ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change}
          </p>
        )}
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {breakdown && <p className="text-xs text-muted-foreground mt-1">{breakdown}</p>}
      </CardContent>
    </Card>
  );
}

function ChainBadge({ chainId }: { chainId: number }) {
  const chainInfo = {
    11155111: { name: 'Sepolia', color: 'bg-blue-500' },
    84532: { name: 'Base Sepolia', color: 'bg-purple-500' },
  };

  const info = chainInfo[chainId as keyof typeof chainInfo] || { name: `Chain ${chainId}`, color: 'bg-gray-500' };

  return (
    <Badge className={`${info.color} text-white`}>
      {info.name}
    </Badge>
  );
}

interface RebalanceActionCardProps {
  reasoning: AIReasoningLog;
  onExecute: (route: Route) => Promise<void>;
  executing: boolean;
}

export function RebalanceActionCard({ reasoning, onExecute, executing }: RebalanceActionCardProps) {
  const route = reasoning.suggested_route as Route;
  const confidence = reasoning.confidence_score;
  const amount = ethers.formatUnits(reasoning.suggested_rebalance_amount, 6);

  if (!route) {
    return null;
  }

  const sourceChain = route.fromChainId;
  const destChain = route.toChainId;
  const gasCost = route.gasCostUSD || '0';
  const estimatedTime = route.steps.reduce((sum, step) => sum + (step.estimate.executionDuration || 0), 0);

  return (
    <Card className="border-2 border-blue-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>🤖 AI-Suggested Rebalance</CardTitle>
          <Badge variant={confidence > 0.8 ? 'success' : confidence > 0.5 ? 'warning' : 'destructive'}>
            {(confidence * 100).toFixed(0)}% Confident
          </Badge>
        </div>
        <CardDescription>
          Based on liquidity analysis at {new Date(reasoning.analysis_timestamp).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <ChainBadge chainId={sourceChain} />
          <ArrowRight className="text-muted-foreground" />
          <ChainBadge chainId={destChain} />
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="text-sm font-medium">{amount} USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Estimated Fee</span>
            <span className="text-sm font-medium">${parseFloat(gasCost).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Estimated Time</span>
            <span className="text-sm font-medium">~{Math.floor(estimatedTime / 60)}m {estimatedTime % 60}s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Route</span>
            <span className="text-sm font-medium text-right max-w-[200px] truncate">
              {route.steps.map(s => s.toolDetails.name).join(' → ')}
            </span>
          </div>
        </div>

        <Separator />

        <div className="space-y-1">
          <p className="text-xs font-medium">Confidence Factors:</p>
          <div className="flex flex-wrap gap-2">
            {reasoning.reasoning_trace.confidence_factors.data_freshness && (
              <Badge variant="outline" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                Fresh Data
              </Badge>
            )}
            {reasoning.reasoning_trace.confidence_factors.sufficient_liquidity && (
              <Badge variant="outline" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                Sufficient Liquidity
              </Badge>
            )}
            {reasoning.reasoning_trace.confidence_factors.cost_efficiency && (
              <Badge variant="outline" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                Cost Efficient
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onExecute(route)}
          disabled={executing || confidence < 0.5}
          className="w-full"
        >
          {executing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Executing Rebalance...
            </>
          ) : (
            'Execute Rebalance via LI.FI'
          )}
        </Button>
        {confidence < 0.5 && (
          <p className="text-xs text-red-500 mt-2 text-center w-full">
            Confidence too low for automatic execution
          </p>
        )}
      </CardFooter>
    </Card>
  );
}

interface StatsOverviewProps {
  reasoning: AIReasoningLog | null;
}

export function StatsOverview({ reasoning }: StatsOverviewProps) {
  if (!reasoning) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const l1Interest = ethers.formatUnits(reasoning.l1_interest_earned, 6);
  const l2Interest = ethers.formatUnits(reasoning.l2_interest_earned, 6);
  const netDebt = ethers.formatUnits(reasoning.net_debt, 6);
  const upcomingUnlocks = reasoning.upcoming_unlocks_24h;
  const l1Unlocks = upcomingUnlocks.filter(u => u.chain_id === 11155111);
  const l2Unlocks = upcomingUnlocks.filter(u => u.chain_id === 84532);
  const totalUnlocks = upcomingUnlocks.reduce((sum, u) => sum + parseFloat(u.amount), 0);

  const debtorChainName = reasoning.debtor_chain_id === 11155111 ? 'Sepolia' : 'Base';
  const isHighDebt = parseFloat(netDebt) > 10;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="L1 Interest Earned"
        value={`${parseFloat(l1Interest).toFixed(2)} USDC`}
        change="+2.3%"
        icon={<TrendingUp className="h-4 w-4 text-green-600" />}
      />
      <StatCard
        title="L2 Interest Earned"
        value={`${parseFloat(l2Interest).toFixed(2)} USDC`}
        change="+1.8%"
        icon={<TrendingUp className="h-4 w-4 text-green-600" />}
      />
      <StatCard
        title="Net Debt"
        value={`${parseFloat(netDebt).toFixed(2)} USDC`}
        subtitle={`${debtorChainName} short`}
        alert={isHighDebt}
        icon={isHighDebt ? <AlertTriangle className="h-4 w-4 text-red-600" /> : <CheckCircle2 className="h-4 w-4 text-green-600" />}
      />
      <StatCard
        title="24h Unlock Volume"
        value={`${totalUnlocks.toFixed(2)} USDC`}
        breakdown={`L1: ${l1Unlocks.length} | L2: ${l2Unlocks.length}`}
        icon={<TrendingUp className="h-4 w-4 text-blue-600" />}
      />
    </div>
  );
}
