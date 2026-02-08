import { ethers } from 'ethers';
import { createConfig, getRoutes, type Route, type RoutesRequest } from '@lifi/sdk';
import {
  getLatestSnapshot,
  getBridgeEventsSince,
  getLastRebalance,
  insertAIReasoning,
  insertRebalanceAction,
  insertChainSnapshot,
  type BridgeEvent,
  type ChainSnapshot,
  type AIReasoningLog,
} from './supabase';
import { SETU_VAULT_ADDRESSES, SETU_VAULT_ABI, USDC_ADDRESSES } from './contracts';

// Configuration
const L1_CHAIN_ID = 11155111; // Ethereum Sepolia
const L2_CHAIN_ID = 84532; // Base Sepolia
const BUFFER_PERCENTAGE = 0.1; // 10% safety buffer
const REBALANCE_THRESHOLD = 1000000; // 1 USDC (in 6 decimals)

// Initialize providers
const l1Provider = new ethers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_L1_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_KEY'
);
const l2Provider = new ethers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_L2_RPC_URL || 'https://sepolia.base.org'
);

// Initialize LI.FI SDK
createConfig({
  integrator: 'setu-rebalancer',
});

export interface RebalanceCalculation {
  l1Interest: bigint;
  l2Interest: bigint;
  netFlow: bigint;
  l1Debt: bigint;
  l2Debt: bigint;
  netDebt: {
    amount: bigint;
    sourceChain: number;
    destChain: number;
  };
  upcomingUnlocks: Array<{
    chain_id: number;
    user: string;
    amount: string;
    unlock_time: string;
  }>;
  shouldRebalance: boolean;
}

export class SetuRebalancerAgent {
  private l1Contract: ethers.Contract;
  private l2Contract: ethers.Contract;

  constructor() {
    this.l1Contract = new ethers.Contract(
      SETU_VAULT_ADDRESSES[L1_CHAIN_ID],
      SETU_VAULT_ABI,
      l1Provider
    );
    this.l2Contract = new ethers.Contract(
      SETU_VAULT_ADDRESSES[L2_CHAIN_ID],
      SETU_VAULT_ABI,
      l2Provider
    );
  }

  /**
   * Main function: Calculate optimal rebalancing strategy
   */
  async calculateOptimalRebalance(): Promise<AIReasoningLog | null> {
    console.log('🤖 Setu Rebalancer Agent: Starting analysis...');

    // Step 1: Collect real-time data
    const [l1Snapshot, l2Snapshot, recentEvents] = await Promise.all([
      this.captureChainSnapshot(L1_CHAIN_ID),
      this.captureChainSnapshot(L2_CHAIN_ID),
      this.getRecentBridgeEvents(),
    ]);

    // Step 2: Calculate interest earned
    const l1Interest = this.calculateInterest(l1Snapshot, recentEvents, L1_CHAIN_ID);
    const l2Interest = this.calculateInterest(l2Snapshot, recentEvents, L2_CHAIN_ID);

    // Step 3: Calculate net transfer flow
    const netFlow = this.calculateNetFlow(recentEvents);

    // Step 4: Check upcoming liquidity needs (next 24 hours)
    const upcomingUnlocks = await this.checkUpcomingUnlocks();

    // Step 5: Calculate net debt
    const { l1Debt, l2Debt, netDebt } = this.calculateNetDebt(
      l1Snapshot,
      l2Snapshot,
      upcomingUnlocks
    );

    console.log(`📊 Analysis Results:
      L1 Interest: ${ethers.formatUnits(l1Interest, 6)} USDC
      L2 Interest: ${ethers.formatUnits(l2Interest, 6)} USDC
      Net Flow (L1→L2): ${ethers.formatUnits(netFlow, 6)} USDC
      L1 Debt: ${ethers.formatUnits(l1Debt, 6)} USDC
      L2 Debt: ${ethers.formatUnits(l2Debt, 6)} USDC
      Net Debt: ${ethers.formatUnits(netDebt.amount, 6)} USDC on Chain ${netDebt.destChain}
    `);

    // Step 6: Query LI.FI for optimal route (if rebalancing needed)
    let quote = null;
    if (netDebt.amount > BigInt(REBALANCE_THRESHOLD)) {
      console.log('🔍 Fetching LI.FI route...');
      quote = await this.queryLiFiRoute(netDebt);
    } else {
      console.log('✅ No rebalancing needed. System is balanced.');
      return null;
    }

    // Step 7: Build reasoning trace
    const reasoning = this.buildReasoningTrace(
      l1Snapshot,
      l2Snapshot,
      l1Interest,
      l2Interest,
      netFlow,
      netDebt,
      upcomingUnlocks,
      quote,
      recentEvents
    );

    // Step 8: Store in database
    const savedReasoning = await insertAIReasoning(reasoning);

    // Also create a suggested rebalance action
    if (quote) {
      await insertRebalanceAction({
        rebalance_timestamp: new Date().toISOString(),
        source_chain_id: netDebt.sourceChain,
        destination_chain_id: netDebt.destChain,
        amount: netDebt.amount.toString(),
        net_debt_at_time: netDebt.amount.toString(),
        lifi_route: quote,
        status: 'suggested',
        ai_reasoning_id: savedReasoning.id,
      });
    }

    console.log('✅ Analysis complete and saved to database');
    return savedReasoning;
  }

  /**
   * Capture current state of a chain
   */
  private async captureChainSnapshot(chainId: number): Promise<ChainSnapshot> {
    const contract = chainId === L1_CHAIN_ID ? this.l1Contract : this.l2Contract;
    const provider = chainId === L1_CHAIN_ID ? l1Provider : l2Provider;

    const [totalAssets, totalSupply, blockNumber] = await Promise.all([
      contract.totalAssets(),
      contract.totalSupply(),
      provider.getBlockNumber(),
    ]);

    // Calculate locked and available amounts
    const lockedAmount = 0n; // Would need to track all user locks
    const availableAmount = totalAssets - lockedAmount;

    const snapshot = {
      chain_id: chainId,
      total_assets: totalAssets.toString(),
      locked_amount: lockedAmount.toString(),
      available_amount: availableAmount.toString(),
      snapshot_timestamp: new Date().toISOString(),
      block_number: blockNumber.toString(), // Convert to string
    };

    await insertChainSnapshot(snapshot);
    return { ...snapshot, id: '' }; // ID will be assigned by DB
  }

  /**
   * Get recent bridge events since last rebalance
   */
  private async getRecentBridgeEvents(): Promise<BridgeEvent[]> {
    const lastRebalance = await getLastRebalance();
    const since = lastRebalance?.rebalance_timestamp || new Date(Date.now() - 7 * 86400000).toISOString();
    return getBridgeEventsSince(since);
  }

  /**
   * Calculate interest earned on a chain
   */
  private calculateInterest(
    snapshot: ChainSnapshot,
    events: BridgeEvent[],
    chainId: number
  ): bigint {
    const currentAssets = BigInt(snapshot.total_assets);
    
    // Sum all inflows and outflows
    const inflows = events
      .filter(e => e.destination_chain_id === chainId)
      .reduce((sum, e) => sum + BigInt(e.amount), 0n);
    
    const outflows = events
      .filter(e => e.source_chain_id === chainId)
      .reduce((sum, e) => sum + BigInt(e.amount), 0n);

    // Interest = Current Assets - (Previous Assets + Inflows - Outflows)
    // Simplified: assume all interest is positive growth
    const netChange = inflows - outflows;
    const interest = currentAssets - netChange;

    return interest > 0n ? interest : 0n;
  }

  /**
   * Calculate net transfer flow between chains
   */
  private calculateNetFlow(events: BridgeEvent[]): bigint {
    const l1ToL2 = events
      .filter(e => e.source_chain_id === L1_CHAIN_ID && e.destination_chain_id === L2_CHAIN_ID)
      .reduce((sum, e) => sum + BigInt(e.amount), 0n);

    const l2ToL1 = events
      .filter(e => e.source_chain_id === L2_CHAIN_ID && e.destination_chain_id === L1_CHAIN_ID)
      .reduce((sum, e) => sum + BigInt(e.amount), 0n);

    return l1ToL2 - l2ToL1; // Positive = L1 losing liquidity
  }

  /**
   * Check for upcoming unlocks in next 24 hours
   */
  private async checkUpcomingUnlocks() {
    const tomorrow = Math.floor(Date.now() / 1000) + 86400;
    const unlocks: Array<{
      chain_id: number;
      user: string;
      amount: string;
      unlock_time: string;
    }> = [];

    // TODO: Maintain a list of users in database or query events
    // For now, return empty array
    return unlocks;
  }

  /**
   * Calculate net debt between chains
   */
  private calculateNetDebt(
    l1Snapshot: ChainSnapshot,
    l2Snapshot: ChainSnapshot,
    upcomingUnlocks: any[]
  ) {
    const l1Available = BigInt(l1Snapshot.available_amount);
    const l2Available = BigInt(l2Snapshot.available_amount);

    // Calculate required liquidity with buffer
    const l1UnlocksSum = upcomingUnlocks
      .filter(u => u.chain_id === L1_CHAIN_ID)
      .reduce((sum, u) => sum + BigInt(u.amount), 0n);
    
    const l2UnlocksSum = upcomingUnlocks
      .filter(u => u.chain_id === L2_CHAIN_ID)
      .reduce((sum, u) => sum + BigInt(u.amount), 0n);

    const l1Required = l1UnlocksSum + (l1UnlocksSum * BigInt(Math.floor(BUFFER_PERCENTAGE * 100))) / 100n;
    const l2Required = l2UnlocksSum + (l2UnlocksSum * BigInt(Math.floor(BUFFER_PERCENTAGE * 100))) / 100n;

    const l1Debt = l1Required > l1Available ? l1Required - l1Available : 0n;
    const l2Debt = l2Required > l2Available ? l2Required - l2Available : 0n;

    // Determine which chain needs funds
    const netDebt = l1Debt > l2Debt
      ? { amount: l1Debt, sourceChain: L2_CHAIN_ID, destChain: L1_CHAIN_ID }
      : { amount: l2Debt, sourceChain: L1_CHAIN_ID, destChain: L2_CHAIN_ID };

    return { l1Debt, l2Debt, netDebt };
  }

  /**
   * Query LI.FI API for optimal route
   */
  private async queryLiFiRoute(netDebt: { amount: bigint; sourceChain: number; destChain: number }) {
    try {
      const sourceChainId = netDebt.sourceChain as 11155111 | 84532;
      const destChainId = netDebt.destChain as 11155111 | 84532;
      
      const routeRequest: RoutesRequest = {
        fromChainId: sourceChainId,
        toChainId: destChainId,
        fromTokenAddress: USDC_ADDRESSES[sourceChainId],
        toTokenAddress: USDC_ADDRESSES[destChainId],
        fromAmount: netDebt.amount.toString(),
        fromAddress: SETU_VAULT_ADDRESSES[sourceChainId],
        toAddress: SETU_VAULT_ADDRESSES[destChainId],
      };

      const result = await getRoutes(routeRequest);
      return result.routes[0] || null; // Return best route
    } catch (error) {
      console.error('❌ Error fetching LI.FI route:', error);
      return null;
    }
  }

  /**
   * Build detailed reasoning trace
   */
  private buildReasoningTrace(
    l1Snapshot: ChainSnapshot,
    l2Snapshot: ChainSnapshot,
    l1Interest: bigint,
    l2Interest: bigint,
    netFlow: bigint,
    netDebt: { amount: bigint; sourceChain: number; destChain: number },
    upcomingUnlocks: any[],
    quote: Route | null,
    events: BridgeEvent[]
  ): Omit<AIReasoningLog, 'id'> {
    const thoughts = [
      `📊 Analyzed L1 (Sepolia): ${ethers.formatUnits(l1Snapshot.total_assets, 6)} USDC total assets`,
      `💰 L1 Interest Earned: ${ethers.formatUnits(l1Interest, 6)} USDC`,
      `📊 Analyzed L2 (Base): ${ethers.formatUnits(l2Snapshot.total_assets, 6)} USDC total assets`,
      `💰 L2 Interest Earned: ${ethers.formatUnits(l2Interest, 6)} USDC`,
      `🔄 Net Transfer Flow (L1→L2): ${ethers.formatUnits(netFlow, 6)} USDC`,
      `📅 Upcoming Unlocks (24h): L1=${upcomingUnlocks.filter(u => u.chain_id === L1_CHAIN_ID).length}, L2=${upcomingUnlocks.filter(u => u.chain_id === L2_CHAIN_ID).length}`,
      `⚖️ Debt Calculation: Chain ${netDebt.destChain} needs ${ethers.formatUnits(netDebt.amount, 6)} USDC`,
      quote
        ? `✅ LI.FI Route Found: ${quote.steps.map(s => s.toolDetails.name).join(' → ')}`
        : `⚠️ No rebalancing needed or route unavailable`,
    ];

    const confidence_factors = {
      data_freshness: Date.now() - new Date(l1Snapshot.snapshot_timestamp).getTime() < 300000,
      sufficient_liquidity: quote ? netDebt.amount < BigInt(l1Snapshot.total_assets) / 2n : false,
      cost_efficiency: quote ? BigInt(quote.gasCostUSD || '0') < netDebt.amount / 100n : false,
    };

    const confidence_score = Object.values(confidence_factors).filter(Boolean).length / 3;

    return {
      analysis_timestamp: new Date().toISOString(),
      l1_interest_earned: l1Interest.toString(),
      l2_interest_earned: l2Interest.toString(),
      net_transfer_l1_to_l2: netFlow.toString(),
      net_debt: netDebt.amount.toString(),
      debtor_chain_id: netDebt.destChain,
      upcoming_unlocks_24h: upcomingUnlocks,
      suggested_rebalance_amount: netDebt.amount.toString(),
      suggested_route: quote,
      reasoning_trace: {
        thoughts,
        confidence_factors,
      },
      confidence_score,
      data_sources: {
        l1_snapshot_id: l1Snapshot.id,
        l2_snapshot_id: l2Snapshot.id,
        event_ids: events.map(e => e.id),
      },
    };
  }

  /**
   * Execute rebalance via LI.FI
   */
  async executeRebalance(route: Route, signer: ethers.Signer): Promise<string> {
    console.log('🚀 Executing rebalance via LI.FI...');
    
    try {
      // For now, return a mock transaction hash
      // In production, you would use LI.FI's execution SDK
      console.log('Route to execute:', route);
      console.log('⚠️ Manual execution required - LI.FI execution not implemented in this demo');
      
      // You would implement actual execution here:
      // const execution = await executeRoute(signer, route);
      
      return '0xmock_transaction_hash_' + Date.now();
    } catch (error) {
      console.error('❌ Rebalance execution failed:', error);
      throw error;
    }
  }
}

// Singleton instance
export const rebalancerAgent = new SetuRebalancerAgent();
