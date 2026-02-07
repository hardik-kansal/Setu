/**
 * SetuVault contract addresses per chain.
 * Replace with your deployed contract addresses.
 */
export const SETU_VAULT_ADDRESSES = {
  421614: "0x0000000000000000000000000000000000000000" as `0x${string}`, // Arbitrum Sepolia
  80002: "0x0000000000000000000000000000000000000000" as `0x${string}`, // Polygon Amoy
} as const;

export const USDC_DECIMALS = 6;

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
