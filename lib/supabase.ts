import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (set these in .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database Types
export interface BridgeEvent {
  id: string;
  tx_hash: string;
  user_address: string;
  amount: string;
  source_chain_id: number;
  destination_chain_id: number;
  block_number: string; // Changed from bigint to string
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  tenderly_action_id?: string;
}

export interface ChainSnapshot {
  id: string;
  chain_id: number;
  total_assets: string;
  locked_amount: string;
  available_amount: string;
  snapshot_timestamp: string;
  block_number: string; // Changed from bigint to string
}

export interface RebalanceAction {
  id: string;
  rebalance_timestamp: string;
  source_chain_id: number;
  destination_chain_id: number;
  amount: string;
  net_debt_at_time: string;
  lifi_route: any;
  lifi_tx_hash?: string;
  status: 'suggested' | 'executed' | 'failed';
  gas_cost?: string;
  execution_time_seconds?: number;
  ai_reasoning_id: string;
}

export interface AIReasoningLog {
  id: string;
  analysis_timestamp: string;
  l1_interest_earned: string;
  l2_interest_earned: string;
  net_transfer_l1_to_l2: string;
  net_debt: string;
  debtor_chain_id: number;
  upcoming_unlocks_24h: Array<{
    chain_id: number;
    amount: string;
    unlock_time: string;
  }>;
  suggested_rebalance_amount: string;
  suggested_route: any;
  reasoning_trace: {
    thoughts: string[];
    confidence_factors: {
      data_freshness: boolean;
      sufficient_liquidity: boolean;
      cost_efficiency: boolean;
    };
  };
  confidence_score: number;
  data_sources: {
    l1_snapshot_id: string;
    l2_snapshot_id: string;
    event_ids: string[];
  };
}

export interface LPUnlock {
  id: string;
  lp_address: string;
  unlock_timestamp: string;
  amount_chain_a: number;
  amount_chain_b: number;
  is_processed: boolean;
}

export interface UnlockVolume24h {
  total_volume: number;
  chain_a_volume: number;
  chain_b_volume: number;
  unlock_count: number;
  unlocks: LPUnlock[];
}

// Helper functions for database operations
export async function insertBridgeEvent(event: Omit<BridgeEvent, 'id'>) {
  const { data, error } = await supabase
    .from('bridge_events')
    .insert(event)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function insertChainSnapshot(snapshot: Omit<ChainSnapshot, 'id'>) {
  const { data, error } = await supabase
    .from('chain_snapshots')
    .insert(snapshot)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getLatestSnapshot(chainId: number): Promise<ChainSnapshot | null> {
  const { data, error } = await supabase
    .from('chain_snapshots')
    .select('*')
    .eq('chain_id', chainId)
    .order('snapshot_timestamp', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getBridgeEventsSince(timestamp: string): Promise<BridgeEvent[]> {
  const { data, error } = await supabase
    .from('bridge_events')
    .select('*')
    .gte('timestamp', timestamp)
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getLastRebalance(): Promise<RebalanceAction | null> {
  const { data, error } = await supabase
    .from('rebalance_actions')
    .select('*')
    .order('rebalance_timestamp', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function insertAIReasoning(reasoning: Omit<AIReasoningLog, 'id'>) {
  const { data, error } = await supabase
    .from('ai_reasoning_logs')
    .insert(reasoning)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function insertRebalanceAction(action: Omit<RebalanceAction, 'id'>) {
  const { data, error } = await supabase
    .from('rebalance_actions')
    .insert(action)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getRecentAIReasoningLogs(limit: number = 10): Promise<AIReasoningLog[]> {
  const { data, error } = await supabase
    .from('ai_reasoning_logs')
    .select('*')
    .order('analysis_timestamp', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

export async function getRebalanceHistory(limit: number = 20): Promise<RebalanceAction[]> {
  const { data, error } = await supabase
    .from('rebalance_actions')
    .select('*')
    .order('rebalance_timestamp', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

export async function get24hUnlockVolume(): Promise<UnlockVolume24h> {
  const now = new Date();
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  const { data, error } = await supabase
    .from('lp_unlocks')
    .select('*')
    .gte('unlock_timestamp', now.toISOString())
    .lte('unlock_timestamp', twentyFourHoursFromNow.toISOString())
    .eq('is_processed', false)
    .order('unlock_timestamp', { ascending: true });
  
  if (error) throw error;
  
  const unlocks = data || [];
  
  const chain_a_volume = unlocks.reduce((sum, unlock) => sum + (unlock.amount_chain_a || 0), 0);
  const chain_b_volume = unlocks.reduce((sum, unlock) => sum + (unlock.amount_chain_b || 0), 0);
  
  return {
    total_volume: chain_a_volume + chain_b_volume,
    chain_a_volume,
    chain_b_volume,
    unlock_count: unlocks.length,
    unlocks
  };
}
