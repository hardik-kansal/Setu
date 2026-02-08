# Setu Tech Stack

## Frontend Framework & Core

- **Next.js 15.0.3** - React framework with App Router and server components
- **Turbopack** - Next-generation bundler for fast development
- **React 18.3.1** - User interface library
- **TypeScript 5.6.3** - Static type checking and enhanced developer experience

## Web3 & Blockchain Infrastructure

- **Wagmi 2.12.0** - React Hooks for Ethereum interactions
- **RainbowKit 2.2.0** - Wallet connection UI with multi-wallet support
- **Viem 2.21.0** - TypeScript-first Ethereum library for contract interactions
- **Ethers.js 6.16.0** - Complete Ethereum wallet and transaction handling
- **LiFi SDK 3.15.5** - Cross-chain bridging aggregator for optimal routes
- **Solidity** - Smart contract language for ERC4626 vaults

### Supported Networks
- Ethereum Sepolia Testnet (Chain ID: 11155111)
- Base Sepolia Testnet (Chain ID: 84532)

## UI Components & Styling

### Core Styling
- **Tailwind CSS 4.0.0** - Utility-first CSS framework
- **PostCSS 8.4.49** - CSS transformation pipeline
- **tailwindcss-animate** - Animation utilities
- **tailwind-merge** - Merge Tailwind classes efficiently

### Component Library
- **Radix UI Components**:
  - Dialog - Modal overlays
  - Progress - Progress indicators
  - Select - Custom dropdown menus
  - Separator - Visual dividers
  - Slot - Composition primitives
  - Tabs - Tabbed interfaces
- **Lucide React** - Modern icon library
- **Framer Motion 11.11.0** - Advanced animation library
- **Recharts 3.7.0** - Declarative charting library
- **Sonner** - Toast notification system

### Utility Libraries
- **Class Variance Authority** - Component variant management
- **clsx** - Conditional className utility

## Backend & Database

- **Supabase 2.95.3** - PostgreSQL database with real-time capabilities
  - Stores rebalance logs and transaction history
  - LP unlock schedules and pending withdrawals
  - AI reasoning traces and decision logs
  - System snapshots and balance history
- **Next.js API Routes** - Serverless backend functions
  - `/api/ai-analysis` - AI decision-making endpoint
  - `/api/lifi-route` - Bridge route optimization
  - `/api/save-rebalance` - Transaction logging

## AI & Decision Making

- **OpenAI API (GPT-4o-mini)** - Primary AI model for rebalancing decisions
- **Google Gemini API** - Alternative AI provider
- **Custom Setu-Agent** - Autonomous rebalancing agent with:
  - Real-time balance monitoring
  - Imbalance detection algorithms
  - Risk assessment logic
  - Confidence scoring system
  - Route optimization

## State Management & Data Fetching

- **TanStack Query 5.62.0** - Async state management and caching
- **React Hooks** - Local state management
- **EventEmitter3** - Event-driven communication

## Automation & Event Processing

- **Tenderly Actions 0.0.9** - Blockchain event monitoring and webhooks
  - Monitors deposit/withdrawal events
  - Triggers automated rebalancing workflows
  - Provides transaction simulation
- **Tenderly CLI** - Deployment and management tools

## Key Integrations

### Decentralized Configuration
- **ENS (Ethereum Name Service)** - On-chain configuration storage
  - AI parameters (threshold, strategy, relay_fee)
  - No redeployment needed for config updates
  - Text records on Sepolia ENS

### Cross-Chain Bridging
- **LiFi Protocol** - Multi-bridge aggregation
- **Stargate Finance** - LayerZero-based bridge
- **Across Protocol** - Optimistic bridge
- **Hop Protocol** - Rollup-native bridge

### Blockchain Data
- **Public RPC Endpoints** - Blockchain state reading
- **Contract ABIs** - Smart contract interfaces
- **Multicall** - Batched contract calls

## Development Tools

- **npm** - Package manager
- **ESLint 9.15.0** - Code linting and style enforcement
- **Next.js Dev Server** - Hot module replacement
- **Tenderly Dashboard** - Smart contract debugging and monitoring

## Architecture Patterns

### Frontend Architecture
- **App Router** - Next.js file-based routing
- **Server Components** - Optimized server-side rendering
- **Client Components** - Interactive UI elements
- **API Routes** - Serverless functions

### Backend Architecture
- **Event-Driven** - Webhook-triggered workflows
- **Serverless** - No infrastructure management
- **Real-Time** - Supabase subscriptions for live updates

### Smart Contract Architecture
- **ERC4626** - Tokenized vault standard
- **Cross-Chain Vaults** - Mirrored vaults on both chains
- **Asset Management** - USDC liquidity pools

## Data Flow

1. **Event Detection** - Tenderly monitors blockchain events
2. **Data Collection** - Fetch balances from contracts via Viem
3. **Database Update** - Store snapshots in Supabase
4. **AI Analysis** - Setu-Agent processes data via OpenAI
5. **Route Finding** - LiFi SDK finds optimal bridge route
6. **Execution** - User approves transaction via wallet
7. **Logging** - Save rebalance action to Supabase

## Security Features

- **Type Safety** - Full TypeScript coverage
- **Wallet Security** - Non-custodial via RainbowKit
- **API Rate Limiting** - Protected endpoints
- **Environment Variables** - Secure credential storage
- **Smart Contract Audits** - Standard ERC4626 implementation

## Performance Optimizations

- **Turbopack** - Fast development builds
- **React Query Caching** - Reduced API calls
- **Code Splitting** - Optimized bundle sizes
- **Server Components** - Reduced client-side JavaScript
- **Image Optimization** - Next.js image component
- **Font Optimization** - Next.js font loading

## Deployment

- **Vercel** - Recommended hosting platform (Next.js optimized)
- **Supabase Cloud** - Managed PostgreSQL database
- **Tenderly Cloud** - Managed blockchain monitoring
- **GitHub Actions** - CI/CD pipeline potential

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=... (optional alternative)
AI_PROVIDER=openai (or gemini)
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+

## Key Files

- `app/page.tsx` - Main dashboard entry point
- `components/dashboard/rebalancer-dashboard.tsx` - AI rebalancer UI
- `components/dashboard/eliza-reasoning-feed.tsx` - AI terminal display
- `lib/rebalancer-agent.ts` - Core rebalancing logic
- `lib/contracts.ts` - Contract addresses and ABIs
- `lib/supabase.ts` - Database client and queries
- `contracts/SetuVault.sol` - ERC4626 vault implementation
- `actions/relayer.ts` - Tenderly webhook handler

## Testing Stack (Potential)

- Jest - Unit testing
- React Testing Library - Component testing
- Playwright - E2E testing
- Hardhat - Smart contract testing

## Version Control

- **Git** - Source control
- **GitHub** - Repository hosting
- **Conventional Commits** - Commit message standard

---

**Last Updated:** February 8, 2026
**Project:** Setu - AI-Powered Cross-Chain Liquidity Rebalancer
**License:** MIT (adjust as needed)
