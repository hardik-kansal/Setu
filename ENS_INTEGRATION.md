# ENS × ElizaOS Integration

## 🌟 Overview

This project demonstrates how to use **ENS (Ethereum Name Service)** as a decentralized configuration layer for AI agents (ElizaOS). Instead of hardcoding parameters or using centralized config servers, the AI reads its configuration directly from on-chain ENS text records.

## 🎯 Features Implemented

### 1. ENS Config Resolver (`ens-config-resolver.tsx`)
- Fetches configuration from ENS text record `org.setu.ai_params` on Sepolia
- Parses JSON configuration including:
  - `threshold`: Rebalance threshold in USD
  - `strategy`: AI strategy (yield_max, cost_min, balanced)
  - `relay_fee`: Fee percentage for relaying
- Real-time refresh capability
- Graceful fallback to mock data for demo purposes

**Tech Stack:**
- `useEnsText` from wagmi
- `normalize` from viem/ens
- Sepolia testnet for ENS resolution

### 2. ElizaOS AI Reasoning Feed (`eliza-reasoning-feed.tsx`)
- Simulates AI decision-making process based on ENS configuration
- Shows step-by-step reasoning:
  - Fetching ENS config
  - Analyzing system state
  - Comparing imbalance vs threshold
  - Determining rebalancing actions
- Real-time log feed with typewriter effects
- Auto-updates when ENS config changes

### 3. User Profile with ENS (`user-profile.tsx`)
- Displays ENS name using reverse resolution
- Shows ENS avatar from IPFS/HTTP
- Falls back to wallet address if no ENS
- Uses `useEnsName` and `useEnsAvatar` hooks
- Resolves against Ethereum mainnet for real ENS names

### 4. ENS Magic Simulator (`ens-magic-simulator.tsx`)
- Interactive demo of "zero-downtime configuration updates"
- Simulates the flow:
  1. Update ENS text record
  2. Transaction confirmed on-chain
  3. ElizaOS detects change
  4. Strategy recomputed
  5. System updated without redeployment
- Before/After comparison view
- Configurable parameters via dialog

### 5. Custom Hook (`use-address-display.ts`)
- Reusable hook for ENS reverse resolution
- Returns display name (ENS or shortened address)
- Used throughout the app for better UX

### 6. Demo Page (`/ens-demo`)
- Comprehensive showcase of all ENS features
- Beautiful gradient UI with animations
- Technical architecture documentation
- Step-by-step usage instructions

## 🔧 Technical Implementation

### ENS Text Record Format
```json
{
  "threshold": 1000,
  "strategy": "yield_max",
  "relay_fee": 0.005
}
```

Store this in the ENS text record with key: `org.setu.ai_params`

### Wagmi Configuration
```typescript
// Includes mainnet for ENS resolution
chains: [baseSepolia, sepolia, mainnet]
```

### Key Hooks Used
- `useEnsText()` - Fetch text records
- `useEnsName()` - Reverse resolution (address → name)
- `useEnsAvatar()` - Fetch avatar images
- `normalize()` - Normalize ENS names for queries

## 🚀 Getting Started

### 1. Set Up ENS Name (Optional)
To test with a real ENS name on Sepolia:

1. Get Sepolia ETH from a faucet
2. Register an ENS name on Sepolia ENS
3. Set text record:
   ```
   Key: org.setu.ai_params
   Value: {"threshold": 1000, "strategy": "yield_max", "relay_fee": 0.005}
   ```

### 2. Run the Demo
```bash
npm run dev
```

Navigate to: `http://localhost:3000/ens-demo`

### 3. Connect Wallet
- Click "Connect Wallet" in the top right
- If you have an ENS name on mainnet, it will display automatically
- The ENS config resolver will attempt to fetch from `setu-vault.eth` on Sepolia

### 4. Try the Magic Feature
1. Click "Simulate ENS Update"
2. Modify the configuration parameters
3. Click "Run Simulation"
4. Watch as the AI instantly adapts to the new configuration!

## 🎨 UI/UX Highlights

- **High-Tech DeFi Command Center** aesthetic
- Gradient backgrounds with glassmorphism
- Real-time animations using Framer Motion
- Terminal-style log feeds with color coding
- Responsive grid layouts
- Toast notifications for key events

## 🔑 Key Benefits

### For Developers
✅ No backend configuration servers  
✅ Instant parameter updates  
✅ Verifiable on-chain history  
✅ Censorship-resistant  
✅ Version control via blockchain

### For Users
✅ Human-readable addresses (ENS names)  
✅ Decentralized identity  
✅ Transparent governance  
✅ Zero trust assumptions  
✅ Enhanced privacy

## 📚 Architecture

```
┌─────────────────┐
│   ENS Registry  │ (Sepolia)
│  setu-vault.eth │
└────────┬────────┘
         │ Text Record: org.setu.ai_params
         ▼
┌─────────────────┐
│  useEnsText()   │ (Wagmi Hook)
└────────┬────────┘
         │ Fetch & Parse
         ▼
┌─────────────────┐
│   ElizaOS AI    │
│  Decision Logic │
└────────┬────────┘
         │ Execute
         ▼
┌─────────────────┐
│  Cross-Chain    │
│  Rebalancing    │
└─────────────────┘
```

## 🌐 Deployment

### Testnet Setup
- **Ethereum Sepolia**: ENS configuration storage
- **Base Sepolia**: Cross-chain operations
- **Ethereum Mainnet**: ENS name/avatar resolution

### Zero Gas Costs
All read operations (ENS lookups) are free! Only writing new text records requires gas.

## 🔮 Future Enhancements

- [ ] Multi-signature governance for ENS updates
- [ ] Historical ENS config tracking
- [ ] Integration with ENS subdomains for per-vault configs
- [ ] DAO voting to update ENS parameters
- [ ] ENS-based access control

## 📖 Resources

- [ENS Documentation](https://docs.ens.domains/)
- [Wagmi ENS Hooks](https://wagmi.sh/react/hooks/useEnsName)
- [Viem ENS Utilities](https://viem.sh/docs/ens/actions/getEnsName)
- [ElizaOS](https://github.com/elizaos/eliza)

---

**Built with ❤️ using ENS, Wagmi, Viem, and ElizaOS**
