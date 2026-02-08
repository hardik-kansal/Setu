-- Setu Rebalancer Dashboard - Supabase Schema
-- Run this SQL in your Supabase SQL Editor to create all required tables

-- 1. Bridge Events Table
CREATE TABLE IF NOT EXISTS bridge_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tx_hash TEXT UNIQUE NOT NULL,
    user_address TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    source_chain_id INTEGER NOT NULL,
    destination_chain_id INTEGER NOT NULL,
    block_number BIGINT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    tenderly_action_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for bridge_events
CREATE INDEX IF NOT EXISTS idx_bridge_events_tx_hash ON bridge_events(tx_hash);
CREATE INDEX IF NOT EXISTS idx_bridge_events_user_address ON bridge_events(user_address);
CREATE INDEX IF NOT EXISTS idx_bridge_events_timestamp ON bridge_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_bridge_events_source_chain ON bridge_events(source_chain_id);
CREATE INDEX IF NOT EXISTS idx_bridge_events_dest_chain ON bridge_events(destination_chain_id);

-- 2. Chain Snapshots Table
CREATE TABLE IF NOT EXISTS chain_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain_id INTEGER NOT NULL,
    total_assets NUMERIC NOT NULL,
    locked_amount NUMERIC NOT NULL,
    available_amount NUMERIC NOT NULL,
    snapshot_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    block_number BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for chain_snapshots
CREATE INDEX IF NOT EXISTS idx_chain_snapshots_chain_id ON chain_snapshots(chain_id);
CREATE INDEX IF NOT EXISTS idx_chain_snapshots_timestamp ON chain_snapshots(snapshot_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_chain_snapshots_chain_timestamp ON chain_snapshots(chain_id, snapshot_timestamp DESC);

-- 3. AI Reasoning Logs Table
CREATE TABLE IF NOT EXISTS ai_reasoning_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    l1_interest_earned NUMERIC NOT NULL,
    l2_interest_earned NUMERIC NOT NULL,
    net_transfer_l1_to_l2 NUMERIC NOT NULL,
    net_debt NUMERIC NOT NULL,
    debtor_chain_id INTEGER NOT NULL,
    upcoming_unlocks_24h JSONB NOT NULL DEFAULT '[]'::jsonb,
    suggested_rebalance_amount NUMERIC NOT NULL,
    suggested_route JSONB,
    reasoning_trace JSONB NOT NULL,
    confidence_score NUMERIC NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    data_sources JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for ai_reasoning_logs
CREATE INDEX IF NOT EXISTS idx_ai_reasoning_logs_timestamp ON ai_reasoning_logs(analysis_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_reasoning_logs_confidence ON ai_reasoning_logs(confidence_score DESC);

-- 4. Rebalance Actions Table
CREATE TABLE IF NOT EXISTS rebalance_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rebalance_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source_chain_id INTEGER NOT NULL,
    destination_chain_id INTEGER NOT NULL,
    amount NUMERIC NOT NULL,
    net_debt_at_time NUMERIC NOT NULL,
    lifi_route JSONB NOT NULL,
    lifi_tx_hash TEXT,
    status TEXT NOT NULL CHECK (status IN ('suggested', 'executed', 'failed')),
    gas_cost NUMERIC,
    execution_time_seconds INTEGER,
    ai_reasoning_id UUID NOT NULL REFERENCES ai_reasoning_logs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for rebalance_actions
CREATE INDEX IF NOT EXISTS idx_rebalance_actions_timestamp ON rebalance_actions(rebalance_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_rebalance_actions_status ON rebalance_actions(status);
CREATE INDEX IF NOT EXISTS idx_rebalance_actions_ai_reasoning ON rebalance_actions(ai_reasoning_id);
CREATE INDEX IF NOT EXISTS idx_rebalance_actions_tx_hash ON rebalance_actions(lifi_tx_hash);

-- Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE bridge_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chain_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reasoning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rebalance_actions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust based on your security requirements)
CREATE POLICY "Enable read access for all users" ON bridge_events FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON chain_snapshots FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON ai_reasoning_logs FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON rebalance_actions FOR SELECT USING (true);

-- Create policies for insert access (you may want to restrict this to service role)
CREATE POLICY "Enable insert for authenticated users" ON bridge_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users" ON chain_snapshots FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users" ON ai_reasoning_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users" ON rebalance_actions FOR INSERT WITH CHECK (true);

-- Create a view for easy querying of latest rebalance recommendations
CREATE OR REPLACE VIEW latest_rebalance_recommendations AS
SELECT 
    r.*,
    a.confidence_score,
    a.reasoning_trace,
    a.l1_interest_earned,
    a.l2_interest_earned,
    a.net_debt,
    a.debtor_chain_id
FROM rebalance_actions r
JOIN ai_reasoning_logs a ON r.ai_reasoning_id = a.id
WHERE r.status = 'suggested'
ORDER BY r.rebalance_timestamp DESC;

-- Create a function to get the latest snapshot for a chain
CREATE OR REPLACE FUNCTION get_latest_chain_snapshot(p_chain_id INTEGER)
RETURNS TABLE (
    id UUID,
    chain_id INTEGER,
    total_assets NUMERIC,
    locked_amount NUMERIC,
    available_amount NUMERIC,
    snapshot_timestamp TIMESTAMPTZ,
    block_number BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cs.id,
        cs.chain_id,
        cs.total_assets,
        cs.locked_amount,
        cs.available_amount,
        cs.snapshot_timestamp,
        cs.block_number
    FROM chain_snapshots cs
    WHERE cs.chain_id = p_chain_id
    ORDER BY cs.snapshot_timestamp DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE bridge_events IS 'Stores all bridge transaction events from BridgeInitiated events';
COMMENT ON TABLE chain_snapshots IS 'Periodic snapshots of liquidity state on each chain';
COMMENT ON TABLE ai_reasoning_logs IS 'AI agent analysis results and reasoning traces';
COMMENT ON TABLE rebalance_actions IS 'Suggested and executed rebalancing actions';
