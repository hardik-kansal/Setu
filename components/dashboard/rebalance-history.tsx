'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, ExternalLink, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface RebalanceLog {
  id: string;
  timestamp: string;
  direction: number;
  assets_transferred: number;
  gas_fee_usd?: number;
  reasoning_trace?: string;
}

export function RebalanceHistory() {
  const [history, setHistory] = useState<RebalanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('rebalance_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading rebalance history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>📊 Rebalance History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="bg-white border-slate-200">
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
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          Rebalance History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((action) => {
            const direction = action.direction === 0 ? 'Sepolia → Base' : 'Base → Sepolia';
            const amount = action.assets_transferred;

            return (
              <div key={action.id} className="flex items-start gap-4 pb-4 border-b border-slate-200 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Executed
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(action.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    ${amount.toFixed(2)} USDC • {direction}
                  </p>
                  {action.gas_fee_usd && (
                    <p className="text-xs text-slate-500 mt-1">
                      Gas Cost: ${action.gas_fee_usd.toFixed(2)}
                    </p>
                  )}
                  {action.reasoning_trace && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {action.reasoning_trace}
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
