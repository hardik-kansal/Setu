'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, ExternalLink } from 'lucide-react';
import type { RebalanceAction } from '@/lib/supabase';
import { ethers } from 'ethers';

interface RebalanceHistoryProps {
  history: RebalanceAction[];
}

function StatusBadge({ status }: { status: 'suggested' | 'executed' | 'failed' }) {
  const variants = {
    suggested: { variant: 'outline' as const, icon: Clock, text: 'Suggested' },
    executed: { variant: 'success' as const, icon: CheckCircle2, text: 'Executed' },
    failed: { variant: 'destructive' as const, icon: XCircle, text: 'Failed' },
  };

  const config = variants[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant}>
      <Icon className="h-3 w-3 mr-1" />
      {config.text}
    </Badge>
  );
}

export function RebalanceHistory({ history }: RebalanceHistoryProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📊 Rebalance History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No rebalance actions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Rebalance History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((action) => {
            const chainNames = {
              11155111: 'Sepolia',
              84532: 'Base Sepolia',
            };
            const amount = ethers.formatUnits(action.amount, 6);
            const sourceName = chainNames[action.source_chain_id as keyof typeof chainNames] || `Chain ${action.source_chain_id}`;
            const destName = chainNames[action.destination_chain_id as keyof typeof chainNames] || `Chain ${action.destination_chain_id}`;

            return (
              <div key={action.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={action.status} />
                    <span className="text-xs text-muted-foreground">
                      {new Date(action.rebalance_timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium">
                    {amount} USDC from {sourceName} → {destName}
                  </p>
                  {action.lifi_tx_hash && (
                    <a
                      href={`https://layerzeroscan.com/tx/${action.lifi_tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"
                    >
                      View Transaction <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {action.execution_time_seconds && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Executed in {action.execution_time_seconds}s • Gas: ${action.gas_cost}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
