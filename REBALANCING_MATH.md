# Rebalancing Logic & Mathematical Model

## Overview

The Setu rebalancer uses a mathematical model to determine when and how much liquidity needs to be moved between chains to maintain optimal balance and ensure sufficient liquidity for user withdrawals.

## Core Mathematical Components

### 1. Chain State Variables

For each chain (L1 = Sepolia, L2 = Base Sepolia):

```
Total_Assets_i = Current total value locked in vault on chain i
Locked_Amount_i = Sum of all user deposits currently locked
Available_Amount_i = Total_Assets_i - Locked_Amount_i
```

### 2. Interest Calculation

Interest earned on each chain since last rebalance:

```
Interest_i = Current_Assets_i - (Previous_Assets_i + Inflows_i - Outflows_i)

Where:
- Inflows_i = Sum of all bridge transfers TO chain i
- Outflows_i = Sum of all bridge transfers FROM chain i
```

If negative (loss scenario), Interest_i = 0

### 3. Net Transfer Flow

Net directional flow between chains:

```
Net_Flow = (L1_to_L2_transfers) - (L2_to_L1_transfers)

Interpretation:
- Positive Net_Flow: L1 losing liquidity to L2
- Negative Net_Flow: L2 losing liquidity to L1
- Zero Net_Flow: Balanced transfer activity
```

### 4. Upcoming Liquidity Requirements

For withdrawals unlocking in next 24 hours:

```
Upcoming_Unlocks_i = Sum of all unlock amounts on chain i in next 24h

Required_Liquidity_i = Upcoming_Unlocks_i × (1 + Buffer_Percentage)

Where Buffer_Percentage = 0.10 (10% safety margin)
```

### 5. Debt Calculation

Liquidity shortfall on each chain:

```
Debt_i = max(0, Required_Liquidity_i - Available_Amount_i)

Net_Debt = |Debt_L1 - Debt_L2|

Debtor_Chain = chain with higher debt value
Creditor_Chain = chain with lower debt value
```

### 6. Rebalancing Decision

Rebalancing is triggered when:

```
Net_Debt > REBALANCE_THRESHOLD

Where REBALANCE_THRESHOLD = 1,000,000 (1 USDC in 6 decimals)
```

Rebalancing direction:

```
Transfer_Amount = Net_Debt
Transfer_Direction = Creditor_Chain → Debtor_Chain
```

## Decision Algorithm

### Step-by-Step Process

**Step 1: Data Collection**
- Fetch current chain snapshots (Total_Assets, Locked_Amount, Available_Amount)
- Query recent bridge events since last rebalance
- Retrieve upcoming unlock schedule

**Step 2: Interest Accounting**
```
For each chain i:
  Calculate Interest_i
  Store in database for analytics
```

**Step 3: Flow Analysis**
```
Net_Flow = Calculate_Transfer_Flow(bridge_events)
Identify trending direction (L1 → L2 or L2 → L1)
```

**Step 4: Liquidity Forecasting**
```
For each chain i:
  Upcoming_Unlocks_i = Query_Unlocks(now, now + 24h)
  Required_Liquidity_i = Upcoming_Unlocks_i × 1.10
  Debt_i = max(0, Required_Liquidity_i - Available_Amount_i)
```

**Step 5: Debt Resolution**
```
If Debt_L1 > Debt_L2:
  Net_Debt = Debt_L1 - Debt_L2
  Direction = L2 → L1
Else:
  Net_Debt = Debt_L2 - Debt_L1
  Direction = L1 → L2
```

**Step 6: Rebalancing Threshold Check**
```
If Net_Debt > 1 USDC:
  Trigger rebalancing
  Query LiFi for optimal bridge route
Else:
  System balanced, no action needed
```

**Step 7: Route Optimization**
```
Query LiFi SDK with:
  - From: Creditor_Chain
  - To: Debtor_Chain
  - Amount: Net_Debt
  - Token: USDC

Select route with:
  - Lowest gas cost
  - Fastest completion time
  - Highest reliability score
```

**Step 8: Confidence Scoring**
```
Confidence_Score = (
  data_freshness_weight × is_data_fresh +
  liquidity_weight × has_sufficient_liquidity +
  cost_weight × is_cost_efficient
) / 3

Where each boolean factor is 1.0 if true, 0.0 if false

Thresholds:
- Data is fresh: snapshot age < 5 minutes
- Sufficient liquidity: Net_Debt < 50% of source chain assets
- Cost efficient: gas_cost < 1% of transfer amount
```

## Advanced Scenarios

### Scenario 1: Balanced System

```
L1_Available = 10,000 USDC
L2_Available = 9,500 USDC
L1_Upcoming_Unlocks = 1,000 USDC
L2_Upcoming_Unlocks = 1,200 USDC

L1_Required = 1,000 × 1.10 = 1,100 USDC
L2_Required = 1,200 × 1.10 = 1,320 USDC

L1_Debt = max(0, 1,100 - 10,000) = 0 USDC
L2_Debt = max(0, 1,320 - 9,500) = 0 USDC

Net_Debt = 0 USDC < 1 USDC threshold

Result: No rebalancing needed
```

### Scenario 2: L2 Liquidity Crisis

```
L1_Available = 15,000 USDC
L2_Available = 800 USDC
L1_Upcoming_Unlocks = 500 USDC
L2_Upcoming_Unlocks = 2,500 USDC

L1_Required = 500 × 1.10 = 550 USDC
L2_Required = 2,500 × 1.10 = 2,750 USDC

L1_Debt = max(0, 550 - 15,000) = 0 USDC
L2_Debt = max(0, 2,750 - 800) = 1,950 USDC

Net_Debt = 1,950 USDC > 1 USDC threshold

Result: Transfer 1,950 USDC from L1 → L2
```

### Scenario 3: Symmetric Debt (Rare)

```
L1_Available = 500 USDC
L2_Available = 600 USDC
L1_Upcoming_Unlocks = 2,000 USDC
L2_Upcoming_Unlocks = 2,100 USDC

L1_Required = 2,000 × 1.10 = 2,200 USDC
L2_Required = 2,100 × 1.10 = 2,310 USDC

L1_Debt = 2,200 - 500 = 1,700 USDC
L2_Debt = 2,310 - 600 = 1,710 USDC

Net_Debt = |1,700 - 1,710| = 10 USDC > 1 USDC

Result: Transfer 10 USDC from L1 → L2
(L2 has slightly higher debt)
```

## Cost-Benefit Analysis

### Gas Cost Calculation

```
Total_Cost = Bridge_Gas_Fee + LiFi_Protocol_Fee + Slippage

Acceptable if: Total_Cost < (Net_Debt × 0.05)
(Cost must be less than 5% of transfer amount)
```

### Expected Value Model

```
EV_Rebalance = (Prevented_Withdrawal_Failures × Avg_User_Value) - Total_Cost

Where:
- Prevented_Withdrawal_Failures = Number of unlocks that would fail without rebalance
- Avg_User_Value = Estimated business value per successful withdrawal
```

Rebalance only if EV_Rebalance > 0

## Safety Mechanisms

### 1. Buffer Percentage
- Adds 10% safety margin to required liquidity
- Prevents edge cases where timing delays cause failures
- Formula: Required = Unlocks × 1.10

### 2. Minimum Threshold
- Only rebalance if Net_Debt > 1 USDC
- Avoids micro-transactions with high relative costs
- Prevents spam rebalancing

### 3. Data Freshness Check
- Only use snapshots less than 5 minutes old
- Prevents decisions on stale data
- Triggers confidence score reduction if data is old

### 4. Liquidity Limit
- Never transfer more than 50% of source chain's total assets
- Maintains minimum operational liquidity on creditor chain
- Protects against catastrophic imbalance

### 5. Cost Efficiency Gate
- Reject routes where gas > 1% of transfer amount
- Ensures economic viability of rebalancing
- May wait for better gas prices if threshold exceeded

## AI Enhancement Layer

The AI model (GPT-4o-mini or Gemini) provides:

### 1. Pattern Recognition
- Identifies historical trends in withdrawal patterns
- Predicts future liquidity needs beyond 24h window
- Adjusts buffer percentage dynamically

### 2. Risk Assessment
```
Risk_Score = weighted_sum(
  imbalance_severity,
  historical_volatility,
  upcoming_unlock_concentration,
  market_conditions
)

If Risk_Score > threshold:
  Increase buffer percentage
  Reduce confidence threshold for rebalancing
```

### 3. Route Selection
- Evaluates multiple bridge options
- Considers historical reliability data
- Balances speed vs cost tradeoffs

### 4. Reasoning Transparency
AI provides human-readable explanations:
- "L2 has 3 large unlocks in next 6 hours"
- "Historical pattern shows Friday evening withdrawal spike"
- "Current gas prices are optimal for rebalancing"

## Constants & Configuration

```
L1_CHAIN_ID = 11155111 (Ethereum Sepolia)
L2_CHAIN_ID = 84532 (Base Sepolia)

BUFFER_PERCENTAGE = 0.10 (10%)
REBALANCE_THRESHOLD = 1_000_000 (1 USDC, 6 decimals)
DATA_FRESHNESS_LIMIT = 300_000 (5 minutes in ms)
MAX_TRANSFER_PERCENTAGE = 0.50 (50% of source chain)
MAX_COST_PERCENTAGE = 0.01 (1% of transfer amount)
UNLOCK_FORECAST_WINDOW = 86400 (24 hours in seconds)

CONFIDENCE_THRESHOLD = 0.90 (90%)
AI_DECISION_THRESHOLD = 0.85 (85%)
```

## Database Schema Integration

### Chain Snapshots Table
```sql
CREATE TABLE chain_snapshots (
  id UUID PRIMARY KEY,
  chain_id INTEGER NOT NULL,
  total_assets NUMERIC NOT NULL,
  locked_amount NUMERIC NOT NULL,
  available_amount NUMERIC NOT NULL,
  snapshot_timestamp TIMESTAMP NOT NULL,
  block_number BIGINT NOT NULL
);
```

### AI Reasoning Logs Table
```sql
CREATE TABLE ai_reasoning_logs (
  id UUID PRIMARY KEY,
  analysis_timestamp TIMESTAMP NOT NULL,
  l1_interest_earned NUMERIC NOT NULL,
  l2_interest_earned NUMERIC NOT NULL,
  net_transfer_l1_to_l2 NUMERIC NOT NULL,
  net_debt NUMERIC NOT NULL,
  debtor_chain_id INTEGER NOT NULL,
  upcoming_unlocks_24h JSONB NOT NULL,
  suggested_rebalance_amount NUMERIC NOT NULL,
  suggested_route JSONB,
  reasoning_trace JSONB NOT NULL,
  confidence_score NUMERIC NOT NULL,
  data_sources JSONB NOT NULL
);
```

### Rebalance Actions Table
```sql
CREATE TABLE rebalance_logs (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL,
  direction INTEGER NOT NULL, -- 0: L1→L2, 1: L2→L1
  assets_transferred NUMERIC NOT NULL,
  gas_fee_usd NUMERIC NOT NULL,
  reasoning_trace TEXT NOT NULL,
  tx_hash TEXT,
  status TEXT NOT NULL -- 'suggested', 'pending', 'completed', 'failed'
);
```

## Performance Metrics

### Key Performance Indicators

1. **Rebalancing Frequency**
   - Target: < 1 rebalance per 24 hours
   - Measures system stability

2. **Withdrawal Success Rate**
   - Target: > 99.5% of unlocks can be fulfilled
   - Primary business metric

3. **Cost Efficiency**
   - Target: Rebalancing costs < 0.5% of transferred amount
   - Economic viability measure

4. **Response Time**
   - Target: Detection to execution < 10 minutes
   - Measures system responsiveness

5. **Prediction Accuracy**
   - Target: AI confidence > 90% for triggered rebalances
   - Measures AI model quality

## Future Enhancements

1. **Multi-Chain Support**: Extend beyond L1/L2 to 3+ chains
2. **Dynamic Buffer**: ML-based buffer percentage adjustment
3. **Gas Price Optimization**: Wait for optimal gas windows
4. **Predictive Rebalancing**: Act before debt occurs
5. **Yield Optimization**: Consider yield differentials in decisions

---

**Last Updated:** February 8, 2026
**Version:** 1.0
**Author:** Setu Protocol Team
