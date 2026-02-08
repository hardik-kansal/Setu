# Rebalancing Logic & Mathematical Model

---

## Overview

The Setu rebalancer uses a sophisticated mathematical model to determine **when** and **how much** liquidity needs to be moved between chains. This ensures optimal balance and sufficient liquidity for user withdrawals while maximizing capital efficiency.

---

## Core Mathematical Components

### 1. Chain State Variables

#### Total Assets (On-Chain)
**Definition:** Net USDC value deposited by LPs, users, or accrued as interest from on-chain sources.

**Code Implementation:** [View Code →](https://github.com/hardik-kansal/Setu/blob/129abdac664423cc004321e155116ceb84a7fe4c/app/api/ai-analysis/route.ts#L48C5-L60C10)

```
totalAssets() = Σ(LP deposits + User deposits + Accrued interest)
```

---

#### Upcoming Unlocks (Next 24 Hours)
**Definition:** Total amount of funds that will become unlocked in the next 24 hours, calculated from Supabase by looping through all LP addresses.

**Code Implementation:** [View Code →](https://github.com/hardik-kansal/Setu/blob/129abdac664423cc004321e155116ceb84a7fe4c/app/api/ai-analysis/route.ts#L75C4-L80C34)

```
upcomingUnlocks = Σ(LP unlock amounts where unlock_time = starting of next day according to block.timestamp)

contract snippet: (block.timestamp / SECONDS_IN_DAY) * SECONDS_IN_DAY
```

---

#### Last Rebalance Data
**Definition:** Historical snapshot of totalAssets() stored in Supabase from the previous rebalancing event.

```
lastRebalanceTotalAssets = Stored value from Supabase
```

---

### 2. Flow Calculations

#### Net Flow Since Last Rebalance
**Definition:** The absolute change in total assets on a chain since the last rebalancing event.

```
netFlow = |currentTotalAssets(chainA) - lastRebalanceTotalAssets(chainA)|
```

> **Note:** For demo purposes, this is assumed to be 0, as predicting AI behavior with real flow data is complex.

---

#### Net Debt Since Last Rebalance
**Definition:** The imbalance created by net flow combined with upcoming unlock obligations.

```
netDebt = netFlow ± (upcomingUnlocks(chainA) - upcomingUnlocks(chainB))
```

Where `±` is chosen such that the maximum absolute value is used.

---

### 3. Balance Threshold

**Threshold Value:** `$1,000 USDC`

> **Demo Configuration:** For video demonstration purposes, this is set to $1 fixed. In production, this value should be retrieved from the operator's ENS address.

#### System Balance Status:
```
if netDebt < $1,000:
    status = "BALANCED"
else:
    status = "UNBALANCED"
```

---

### 4. Imbalance Percentage Calculation

The imbalance percentage represents how severe the liquidity distribution problem is:

```
imbalance% = (2 × netDebt) / (totalAssets(chainA) + totalAssets(chainB)) × 100

Simplified:
imbalance% = (2 × netDebt × 100) / avgAssets
```

**Where:**
- `avgAssets = (totalAssets(chainA) + totalAssets(chainB)) / 2`

---

### 5. Severity Analysis

**Classification:** Severity should be analyzed by AI based on trends and historical data. For demo purposes, fixed thresholds are used:

| Imbalance % | Severity Level |
|------------|----------------|
| > 50% | 🔴 **HIGH** |
| > 20% | 🟠 **MEDIUM** |
| > 10% | 🟡 **LOW** |
| ≤ 10% | 🟢 **BALANCED** |

```python
if imbalance > 50:
    severity = "HIGH"
elif imbalance > 20:
    severity = "MEDIUM"
elif imbalance > 10:
    severity = "LOW"
else:
    severity = "BALANCED"
```

---

### 6. Confidence Analysis

**Definition:** AI-powered confidence level in the rebalancing recommendation, purely based on historical trends and data patterns.

**Production Behavior:** AI analyzes trends to determine confidence (0-100%)

**Demo Configuration:** For hackathon demonstration, confidence is fixed at **95%** to showcase the system behavior predictably.

```
confidence = AI_analyze_trends() // Production
confidence = 95                  // Demo
```

> **Note:** Confidence analysis is only performed when the system is in an **UNBALANCED** state.

---

## AI Prompt Construction

The AI receives a structured prompt with all calculated metrics to make an informed rebalancing decision.

**Code Implementation:** [View Code →](https://github.com/hardik-kansal/Setu/blob/129abdac664423cc004321e155116ceb84a7fe4c/app/api/ai-analysis/route.ts#L148C1-L170C4)

### Prompt Structure:
```
Given the following liquidity state:

Chain A:
- Total Assets: ${totalAssets_A}
- Upcoming Unlocks (24h): ${upcomingUnlocks_A}

Chain B:
- Total Assets: ${totalAssets_B}
- Upcoming Unlocks (24h): ${upcomingUnlocks_B}

Calculated Metrics:
- Net Debt: ${netDebt}
- Imbalance %: ${imbalance}%
- Severity: ${severity}

Should the system rebalance? If yes, recommend the optimal amount and direction.
```

---

## Complete Rebalancing Algorithm

### Step-by-Step Process:

1. **Fetch Current State**
   - Query `totalAssets()` from both chain contracts
   - Fetch `upcomingUnlocks` from Supabase
   - Retrieve `lastRebalanceData` from Supabase

2. **Calculate Metrics**
   - Compute `netFlow` for each chain
   - Calculate `netDebt` between chains
   - Determine `imbalance%`

3. **Evaluate Balance Status**
   - Compare `netDebt` against threshold ($1,000)
   - Classify severity level

4. **AI Decision Making**
   - If UNBALANCED: Generate AI prompt with all metrics
   - AI analyzes trends and recommends action
   - Calculate confidence score

5. **Route Determination** (if rebalancing needed)
   - Query Li.Fi for optimal cross-chain route
   - Consider gas costs, slippage, and execution time

6. **Execute Rebalance**
   - Execute transaction through Li.Fi
   - Update Supabase with new rebalance data
   - Emit events for monitoring

---

## Example Calculation

### Scenario:
- **Chain A Total Assets:** $100,000
- **Chain B Total Assets:** $50,000
- **Chain A Upcoming Unlocks:** $30,000
- **Chain B Upcoming Unlocks:** $5,000
- **Last Rebalance Total A:** $98,000

### Calculations:
```
netFlow(A) = |100,000 - 98,000| = $2,000

netDebt = 2,000 + (30,000 - 5,000) = $27,000

imbalance% = (2 × 27,000 × 100) / (100,000 + 50,000)
           = 5,400,000 / 150,000
           = 36%

severity = MEDIUM (since 36% > 20%)

status = UNBALANCED (since $27,000 > $1,000)
```

### AI Recommendation:
"Rebalance $15,000 from Chain A to Chain B to prepare for upcoming unlocks and reduce imbalance to ~12%."

---

## Future Enhancements

- **Dynamic Thresholds:** Adjust thresholds based on historical volatility
- **Predictive Modeling:** Use ML to forecast unlock patterns
- **Multi-Chain Support:** Extend algorithm for 3+ chains
- **Gas Optimization:** Factor in gas costs for rebalancing decisions
- **Risk Scoring:** Incorporate chain-specific risk metrics
