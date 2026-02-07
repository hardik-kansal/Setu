/**
 * SetuVault contract addresses per chain.
 * Replace with your deployed contract addresses.
 */
export const SETU_VAULT_ADDRESSES = {
  84532: "0x0000000000000000000000000000000000000000" as `0x${string}`, // Base Sepolia
  11155111: "0x0000000000000000000000000000000000000000" as `0x${string}`, // Ethereum Sepolia
} as const;

/**
 * USDC token addresses per chain (for balance display).
 * Update if using different testnet USDC.
 */
export const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`, // Base Sepolia (USDC)
  11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as `0x${string}`, // Ethereum Sepolia
};

export const USDC_DECIMALS = 6;

/** Minimal ERC20 ABI for balanceOf */
export const ERC20_BALANCE_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const SETU_VAULT_ABI = [
  {
    inputs: [
      { name: "_usdc", type: "address" },
      { name: "_aavePool", type: "address" },
      { name: "_aUsdc", type: "address" },
      { name: "_relayer", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ name: "_amount", type: "uint256" }],
    name: "bridge",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_amount", type: "uint256" },
      { name: "_days", type: "uint256" },
    ],
    name: "depositLP",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawLP",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_user", type: "address" }],
    name: "getUSDCValue",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_user", type: "address" }],
    name: "getTimeLeft",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_user", type: "address" }],
    name: "getUnlockTimestamp",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_user", type: "address" }],
    name: "canWithdraw",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "userLock",
    outputs: [
      { name: "lpAmount", type: "uint256" },
      { name: "unlockTime", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalAssets",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
