# Setu - 5 Minute Setup Guide

Get your AI-powered cross-chain liquidity rebalancer running in 5-10 minutes.

---

## Prerequisites

- Node.js 18+ and npm installed
- Git installed
- A wallet with testnet tokens (Sepolia ETH & Base Sepolia ETH)
- 5-10 minutes of your time

---

## Step 1: Clone & Install 

```bash
# Clone the repository
git clone <your-repo-url>
cd Setu

# Install dependencies
npm install
```

**Expected output:** Dependencies installing (should take 30-60 seconds)

---

## Step 2: Environment Setup 

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

#### Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a new project (free tier works)
3. Go to Settings → API
4. Copy **Project URL** and **anon/public key** (starts with `eyJ...`)

#### OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Copy the key (starts with `sk-...`)

#### Alternative - Gemini API Key

1. Go to [ai.google.dev](https://ai.google.dev)
2. Get an API key
3. Set `AI_PROVIDER=gemini`

---

## Step 3: Database Setup 

Run the Supabase schema to create required tables:

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the contents of `supabase/schema.sql`
4. Paste and run the SQL

---

## Step 4: Link Tenderly

### Prerequisites

- Tenderly account
- Tenderly CLI installed

```bash
npm install -g @tenderly/cli
tenderly login
```

### (Best way to do) Clean existing setup

1. **Delete the existing `actions/` folder** (if present)

2. **Initialize Tenderly Actions**

   ```bash
   tenderly actions init
   ```

3. **Copy your existing relayer.ts logic** and paste it into `actions/example.ts`. Rename `example.ts` → `relayer.ts`

4. **Paste code of existing `tenderly.yml`**. Update the following fields:
   - `account_id`: `<your_tenderly_username>`
   - `project_slug`: `<your_project_slug>`

5. **Deploy scripts to Tenderly**

   ```bash
   tenderly actions deploy
   ```

> **Important Notes:**
> - Make sure your project exists in the Tenderly dashboard before deploying
> - Environment variables (RPC URLs, private keys, API keys) should be added via: **Tenderly Dashboard → Project → Settings → Environment Variables**
> - **Do not hardcode secrets** in `relayer.ts`

---
## Step 5: Set Up ENS Name 
To test with a real ENS name on Sepolia:

1. Get Sepolia ETH from a faucet
2. Register an ENS name on Sepolia ENS
3. Set text record:
   ```
   Key: org.setu.ai_params
   Value: {"threshold": 1000, "strategy": "yield_max", "relay_fee": 0.005}
   ```

## Step 6: Start Development Server 

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

## Step 6: Connect Wallet & Test 

1. Click **Connect Wallet** in the top right
2. Select your wallet (MetaMask, WalletConnect, etc.)
3. Switch to **Sepolia** or **Base Sepolia** network
4. Click **Run AI Analysis** to test the system

**If everything works, you'll see:**

- ✅ AI terminal showing real-time analysis
- ✅ Chain balance data from contracts
- ✅ Rebalancing recommendations (if imbalance detected)

---

## 🎉 You're all set!

Your Setu AI-powered cross-chain liquidity rebalancer is now running.


