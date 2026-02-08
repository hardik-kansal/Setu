# 🤖 Setu Rebalancer Dashboard

An AI-Powered Cross-Chain Liquidity Management System for monitoring and rebalancing liquidity between Ethereum Sepolia (L1) and Base Sepolia (L2) using LI.FI routes.

## 🎯 Features

- **Real-time Liquidity Monitoring**: Tracks total assets, locked amounts, and available liquidity on both chains
- **AI-Powered Analysis**: Calculates optimal rebalancing strategies based on:
  - Interest earned on each chain
  - Net transfer flows between chains
  - Upcoming unlock requirements
  - Liquidity imbalances
- **LI.FI Integration**: Finds optimal cross-chain routes with gas cost estimation
- **Confidence Scoring**: AI provides confidence scores based on data freshness, liquidity sufficiency, and cost efficiency
- **Interactive Dashboard**: Beautiful UI with real-time stats, AI reasoning terminal, and action cards
- **Historical Tracking**: Complete audit trail of all rebalancing actions

## 📋 Prerequisites

1. **Supabase Account**: Sign up at https://supabase.com
2. **RPC Providers**: Ethereum Sepolia and Base Sepolia RPC endpoints
3. **Node.js**: Version 18+ recommended
4. **Wallet**: MetaMask or any Web3 wallet for executing rebalances

## 🚀 Quick Start

### 1. Install Dependencies

All dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 2. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/schema.sql`
4. Execute the SQL to create all tables and indexes

The schema creates 4 main tables:
- `bridge_events`: Bridge transaction events
- `chain_snapshots`: Periodic liquidity snapshots
- `ai_reasoning_logs`: AI analysis results
- `rebalance_actions`: Rebalancing suggestions and executions

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# RPC Providers
NEXT_PUBLIC_L1_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_L2_RPC_URL=https://sepolia.base.org
```

### 4. Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 and navigate to the "AI Rebalancer" tab.

## 📊 How It Works

### Analysis Flow

1. **Data Collection**: 
   - Fetches latest chain snapshots from both L1 and L2
   - Queries recent bridge events from Supabase
   - Reads real-time contract state using ethers.js

2. **Interest Calculation**:
   - Compares current assets vs. historical inflows/outflows
   - Identifies interest earned from Compound V3 yield

3. **Net Flow Analysis**:
   - Sums all L1→L2 and L2→L1 bridge transfers
   - Calculates net liquidity movement

4. **Debt Calculation**:
   - Projects upcoming unlock requirements (24h window)
   - Adds 10% safety buffer
   - Identifies which chain is short on liquidity

5. **Route Optimization**:
   - Queries LI.FI API for best cross-chain route
   - Considers gas costs, execution time, and liquidity

6. **Confidence Scoring**:
   - Data freshness: Is snapshot < 5 minutes old?
   - Sufficient liquidity: Is amount < 50% of total assets?
   - Cost efficiency: Is gas cost < 1% of transfer amount?

### Execution Flow

1. User clicks "Execute Rebalance via LI.FI"
2. Connects wallet and approves transaction
3. LI.FI SDK executes the optimal route
4. Status updates stored in Supabase
5. Dashboard refreshes with new data

## 🔑 Key Components

### Backend Logic

- **`lib/rebalancer-agent.ts`**: Core AI agent with analysis algorithms
- **`lib/supabase.ts`**: Database client and helper functions
- **`lib/contracts.ts`**: Contract addresses and ABIs

### Frontend Components

- **`components/dashboard/rebalancer-dashboard.tsx`**: Main dashboard orchestrator
- **`components/dashboard/rebalancer-stats.tsx`**: Stats cards and action card
- **`components/dashboard/ai-terminal.tsx`**: AI reasoning terminal feed
- **`components/dashboard/rebalance-history.tsx`**: Historical timeline

## 📝 Contract Addresses

```
L1 (Ethereum Sepolia): 0x010a712748b9903c90deec684f433bae57a67476
L2 (Base Sepolia):      0x8116cFd461C5AB410131Fd6925e6D394F0065Ee2
```

## 🔧 Configuration

Edit `lib/rebalancer-agent.ts` to adjust:

```typescript
const BUFFER_PERCENTAGE = 0.1;        // 10% safety buffer
const REBALANCE_THRESHOLD = 1000000;  // 1 USDC minimum (6 decimals)
```

## 🎨 UI Features

### Stats Overview
- L1 Interest Earned
- L2 Interest Earned
- Net Debt (with alert for high debt)
- 24h Unlock Volume

### AI Reasoning Terminal
- Real-time analysis logs
- Typewriter-style output
- Color-coded messages (success/warning/info)
- Auto-scrolling

### Action Card
- Suggested rebalance amount
- LI.FI route visualization
- Gas cost estimation
- Confidence score badge
- One-click execution

### History Timeline
- All past rebalancing actions
- Status badges (suggested/executed/failed)
- Transaction links
- Execution metrics

## 🔐 Security Considerations

1. **Row Level Security**: Enable RLS in Supabase for production
2. **API Keys**: Never commit `.env.local` to version control
3. **Wallet Security**: Always verify transaction details before signing
4. **Rate Limiting**: Consider adding rate limits for AI analysis calls

## 🧪 Testing

### Manual Testing

1. Navigate to AI Rebalancer tab
2. Click "Run AI Analysis"
3. Check terminal for reasoning logs
4. Verify stats update correctly
5. Test execute button (requires wallet connection)

### Populating Test Data

You can manually insert test data into Supabase:

```sql
-- Insert a test bridge event
INSERT INTO bridge_events (tx_hash, user_address, amount, source_chain_id, destination_chain_id, block_number, status)
VALUES ('0xtest123', '0x1234...', 1000000, 11155111, 84532, 12345, 'completed');

-- Insert test snapshots
INSERT INTO chain_snapshots (chain_id, total_assets, locked_amount, available_amount, block_number)
VALUES (11155111, 10000000000, 2000000000, 8000000000, 12345);
```

## 📈 Future Enhancements

- [ ] Real-time WebSocket updates from Tenderly
- [ ] Historical charts with Recharts
- [ ] ElizaOS chat integration for Q&A
- [ ] Automated rebalancing (with multi-sig approval)
- [ ] Email/Telegram notifications for critical imbalances
- [ ] Machine learning model for prediction
- [ ] Support for additional chains

## 🐛 Troubleshooting

### "Cannot read properties of null"
- Ensure Supabase credentials are correct in `.env.local`
- Check that database tables are created

### "Network error"
- Verify RPC URLs are working
- Check if you have enough Infura credits

### "No route found"
- LI.FI may not have a route for small amounts
- Try with larger test amounts (>10 USDC)

### "Insufficient funds"
- Ensure connected wallet has gas on source chain
- Verify USDC balance in vault contract

## 📚 Resources

- [LI.FI Documentation](https://docs.li.fi/)
- [Supabase Documentation](https://supabase.com/docs)
- [Ethers.js v6 Docs](https://docs.ethers.org/v6/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contributing

This is a demo/prototype. For production use:
1. Add comprehensive error handling
2. Implement proper authentication
3. Add unit tests
4. Set up monitoring and alerting
5. Enable RLS policies in Supabase

## 📄 License

MIT License - see LICENSE file for details

---

Built with ❤️ for the Setu cross-chain bridge ecosystem
