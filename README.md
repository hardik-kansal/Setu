# Setu — AI-Driven Cross-Chain Bridge Dashboard

A high-end, glassmorphic DeFi dashboard for the Setu bridge on **Arbitrum Sepolia** and **Polygon Amoy**. Built with Next.js 15 (App Router), Tailwind CSS v4, shadcn/ui, Wagmi v2, RainbowKit, and Framer Motion.

## Features

- **Bridge**: Transfer USDC via `bridge(uint256 amount)` with Sonner toasts (Transaction Pending / Bridge Initiated).
- **Yield**: LP dashboard with Total Locked (zLP), Current Value (USDC), Deposit LP (1 / 3 / 7 days), midnight countdown from `getTimeLeft(user)`, and Withdraw enabled only when `canWithdraw(user)` is true.
- **System Status**: Side panel with a mock terminal showing AI Agent (Setu Manager) logs.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4, glassmorphic dark theme (Indigo & Teal)
- **UI**: shadcn/ui (Card, Button, Tabs, Progress, Input), Framer Motion
- **Web3**: Wagmi v2, RainbowKit, viem
- **Toasts**: Sonner

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env.local` and set your WalletConnect project ID:

   ```bash
   cp .env.example .env.local
   ```

   Get a project ID at [WalletConnect Cloud](https://cloud.walletconnect.com).

3. **Contract addresses**

   Update `lib/contracts.ts` with your deployed `SetuVault` addresses for:

   - Arbitrum Sepolia (chain ID `421614`)
   - Polygon Amoy (chain ID `80002`)

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
├── app/
│   ├── globals.css      # Tailwind v4 + theme + glass styles
│   ├── layout.tsx       # Root layout, Toaster, Providers
│   └── page.tsx         # Dashboard (Bridge / Yield tabs + System Status)
├── components/
│   ├── providers.tsx    # Wagmi + QueryClient + RainbowKit
│   ├── dashboard/
│   │   ├── header.tsx       # Logo + ConnectButton
│   │   ├── bridge-tab.tsx   # USDC input + Transfer
│   │   ├── yield-tab.tsx    # LP stats, Deposit LP, Countdown, Withdraw
│   │   └── system-status.tsx# Mock AI terminal logs
│   └── ui/                  # shadcn-style Button, Card, Tabs, Progress, Input
├── hooks/
│   └── use-setu-vault.ts    # Contract reads/writes (bridge, depositLP, withdrawLP, getUSDCValue, getTimeLeft, canWithdraw, userLock)
├── lib/
│   ├── wagmi.ts         # RainbowKit getDefaultConfig (Arbitrum Sepolia + Polygon Amoy)
│   ├── contracts.ts     # SetuVault ABI + addresses + USDC decimals
│   └── utils.ts         # cn, formatUSDC, parseUSDC, formatTimeLeft
└── contracts/
    └── SetuVault.sol    # Reference contract
```

## Networks

- **Arbitrum Sepolia** — Chain ID `421614`
- **Polygon Amoy** — Chain ID `80002`

Wagmi and RainbowKit are configured for these two chains with viem `http()` transports.
