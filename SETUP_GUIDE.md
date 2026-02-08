# Setu - 5 Minute Setup Guide

Get your AI-powered cross-chain liquidity rebalancer running in 5 minutes.

## Prerequisites

- Node.js 18+ and npm installed
- Git installed
- A wallet with testnet tokens (Sepolia ETH & Base Sepolia ETH)
- 5 minutes of your time

---

## Step 1: Clone & Install (1 minute)

```bash
# Clone the repository
git clone <your-repo-url>
cd Setu

# Install dependencies
npm install
```

**Expected output:** Dependencies installing (should take 30-60 seconds)

---

## Step 2: Environment Setup (2 minutes)

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Provider (Choose one)
OPENAI_API_KEY=sk-...
# OR
GEMINI_API_KEY=...
AI_PROVIDER=openai  # or 'gemini'

# RPC Endpoints (Optional - uses public RPCs by default)
NEXT_PUBLIC_L1_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_L2_RPC_URL=https://sepolia.base.org
```

### Where to get these:

**Supabase Credentials:**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project (free tier works)
3. Go to Settings → API
4. Copy **Project URL** and **anon/public key** (starts with `eyJ...`)

**OpenAI API Key:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Copy the key (starts with `sk-...`)

**Alternative - Gemini API Key:**
1. Go to [ai.google.dev](https://ai.google.dev)
2. Get an API key
3. Set `AI_PROVIDER=gemini`

---

## Step 3: Database Setup (1 minute)

Run the Supabase schema to create required tables:

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the contents of `supabase/schema.sql`
4. Paste and run the SQL

**Tables created:**
- `chain_snapshots` - Chain balance history
- `bridge_events` - Cross-chain transfers
- `lp_unlocks` - User withdrawal schedules
- `rebalance_logs` - Rebalancing history
- `ai_reasoning_logs` - AI decision traces

---

## Step 4: Start Development Server (30 seconds)

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 15.0.3 (Turbopack)
- Local:        http://localhost:3000
✓ Ready in 865ms
```

Open your browser to **http://localhost:3000**

---

## Step 5: Connect Wallet & Test (30 seconds)

1. Click **Connect Wallet** in the top right
2. Select your wallet (MetaMask, WalletConnect, etc.)
3. Switch to **Sepolia** or **Base Sepolia** network
4. Click **Run AI Analysis** to test the system

**If everything works, you'll see:**
- AI terminal showing real-time analysis
- Chain balance data from contracts
- Rebalancing recommendations (if imbalance detected)

---

## Quick Start Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` file created with Supabase credentials
- [ ] AI API key added (OpenAI or Gemini)
- [ ] Database schema imported to Supabase
- [ ] Dev server running (`npm run dev`)
- [ ] Wallet connected to testnet
- [ ] AI analysis runs successfully

---

## Common Issues & Fixes

### Issue: "Unexpected token '<'" error

**Cause:** Supabase credentials are incorrect

**Fix:** 
1. Check that your `NEXT_PUBLIC_SUPABASE_ANON_KEY` starts with `eyJ...`
2. Verify the URL is correct
3. Restart the dev server after changing `.env.local`

### Issue: AI analysis fails

**Cause:** Missing or invalid API key

**Fix:**
1. Verify your OpenAI/Gemini API key is correct
2. Check that `AI_PROVIDER` matches your key type
3. Ensure you have API credits available

### Issue: Contract read errors

**Cause:** RPC rate limiting or network issues

**Fix:**
1. Add custom RPC URLs to `.env.local`
2. Get free RPC endpoints from:
   - [Infura](https://infura.io) for Sepolia
   - [Alchemy](https://alchemy.com) for Base Sepolia

### Issue: Port 3000 already in use

**Fix:**
```bash
# Next.js will automatically try port 3001
# Or specify a different port:
npm run dev -- -p 3002
```

---

## What's Next?

### For Development:
- Read `TECH_STACK.md` for architecture overview
- Read `REBALANCING_MATH.md` for algorithm details
- Read `ENS_INTEGRATION.md` for configuration system

### For Deployment:
```bash
# Build for production
npm run build

# Start production server
npm run start
```

**Recommended hosting:** Vercel (optimized for Next.js)

### For Testing:
1. Get testnet tokens:
   - Sepolia ETH: [sepoliafaucet.com](https://sepoliafaucet.com)
   - Base Sepolia ETH: [base.org/faucet](https://base.org/faucet)
   - USDC: Mint from testnet faucets

2. Deploy test contracts:
   - Deploy `contracts/SetuVault.sol` to both networks
   - Update addresses in `lib/contracts.ts`

3. Test the bridge:
   - Deposit USDC on one chain
   - Run AI analysis
   - Watch automatic rebalancing logic

---

## Project Structure Quick Reference

```
Setu/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Main dashboard
│   └── api/                 # Serverless API routes
│       ├── ai-analysis/     # AI decision endpoint
│       ├── lifi-route/      # Bridge route finder
│       └── save-rebalance/  # Transaction logger
│
├── components/
│   ├── dashboard/           # Dashboard components
│   │   ├── eliza-reasoning-feed.tsx  # AI terminal
│   │   ├── rebalancer-dashboard.tsx  # Main UI
│   │   └── combined-rebalance-display.tsx
│   └── ui/                  # Shadcn components
│
├── lib/
│   ├── rebalancer-agent.ts  # Core AI logic
│   ├── supabase.ts          # Database queries
│   ├── contracts.ts         # Contract ABIs & addresses
│   └── wagmi.ts             # Web3 configuration
│
├── contracts/
│   └── SetuVault.sol        # ERC4626 vault contract
│
├── supabase/
│   └── schema.sql           # Database schema
│
└── actions/
    └── relayer.ts           # Tenderly webhook handler
```

---

## Key Features Available After Setup

1. **AI Rebalancing Terminal**
   - Real-time analysis of chain balances
   - Automated rebalancing recommendations
   - Confidence scoring and risk assessment

2. **Cross-Chain Bridge**
   - LiFi-powered optimal route finding
   - Multi-bridge aggregation
   - Gas-efficient transfers

3. **Liquidity Management**
   - Track LP deposits and withdrawals
   - Monitor upcoming unlock schedules
   - Interest earning analytics

4. **ENS Configuration**
   - On-chain parameter storage
   - No redeployment needed for updates
   - Decentralized configuration

---

## Support & Documentation

- **Technical Questions:** Check `TECH_STACK.md`
- **Algorithm Details:** Read `REBALANCING_MATH.md`
- **ENS Setup:** See `ENS_INTEGRATION.md`
- **Rebalancer Guide:** Review `REBALANCER_README.md`

---

## Production Checklist

Before deploying to production:

- [ ] Smart contracts audited
- [ ] All environment variables set
- [ ] Database backed up
- [ ] Rate limiting configured
- [ ] Error monitoring setup (Sentry recommended)
- [ ] Analytics configured
- [ ] Tenderly actions deployed
- [ ] ENS configuration deployed
- [ ] Test rebalancing on testnet
- [ ] Gas optimization verified

---

## Performance Expectations

**After successful setup:**
- Page load: < 2 seconds
- AI analysis: 5-15 seconds
- Route finding: 2-5 seconds
- Contract reads: < 1 second each

**System Requirements:**
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- Wallet extension installed
- Stable internet connection
- Testnet tokens for transactions

---

**Total Setup Time:** 5 minutes  
**Difficulty Level:** Intermediate  
**Prerequisites:** Basic Web3 knowledge

**Ready to build?** Start with Step 1 and you'll be running in 5 minutes! 🚀

---

**Last Updated:** February 8, 2026  
**Version:** 1.0  
**Maintained by:** Setu Protocol Team
