-- 1. Table for Initial Deposits & Current Baseline
CREATE TABLE lp_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lp_address TEXT NOT NULL,
    deposit_timestamp TIMESTAMPTZ DEFAULT now(),
    chain_a_assets DECIMAL NOT NULL DEFAULT 0, -- Total USDC on Chain A at deposit
    chain_b_assets DECIMAL NOT NULL DEFAULT 0, -- Total USDC on Chain B at deposit
    lp_token_balance DECIMAL NOT NULL DEFAULT 0 -- For tracking share of the pool
);

-- 2. Table for Planned Withdrawals (The "Unlock" Queue)
CREATE TABLE lp_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lp_address TEXT NOT NULL,
    unlock_timestamp TIMESTAMPTZ NOT NULL, -- The target for your queries
    amount_chain_a DECIMAL NOT NULL DEFAULT 0,
    amount_chain_b DECIMAL NOT NULL DEFAULT 0,
    is_processed BOOLEAN DEFAULT false
);

-- 3. Table for Rebalancing History (The AI's "Action Log")
CREATE TABLE rebalance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT now(),
    direction INT NOT NULL, -- 0: Chain A -> B | 1: Chain B -> A
    assets_transferred DECIMAL NOT NULL,
    gas_fee_usd DECIMAL, -- Helpful for AI to calculate profitability
    reasoning_trace TEXT -- Store the Gemini model's "Conclusion" here
);

---
-- PERFORMANCE INDEXES
---

-- Optimized for: "Give me all withdrawals happening in the next 24 hours"
CREATE INDEX idx_unlock_time ON lp_unlocks (unlock_timestamp);

-- Optimized for: "Get the last state after a rebalance"
CREATE INDEX idx_rebalance_time ON rebalance_logs (timestamp DESC);

-- Optimized for: "Find all deposits for a specific user"
CREATE INDEX idx_lp_addr ON lp_deposits (lp_address);