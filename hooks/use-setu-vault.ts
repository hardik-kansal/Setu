"use client";

import { useAccount, useReadContract, useWriteContract, useChainId } from "wagmi";
import { parseUnits } from "viem";
import {
  SETU_VAULT_ABI,
  SETU_VAULT_ADDRESSES,
  USDC_ADDRESSES,
  ERC20_BALANCE_ABI,
  USDC_DECIMALS,
} from "@/lib/contracts";

// Add ERC20 approve ABI
const ERC20_APPROVE_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export function useSetuVaultAddress() {
  const chainId = useChainId();
  return (SETU_VAULT_ADDRESSES as Record<number, `0x${string}`>)[chainId];
}

/** USDC balance for the connected wallet on a specific chain (for Bridge tab). */
export function useUSDCBalance(chainId: number) {
  const { address } = useAccount();
  const usdcAddress = USDC_ADDRESSES[chainId];

  const { data, refetch, isError, isLoading } = useReadContract({
    address: usdcAddress ?? undefined,
    abi: ERC20_BALANCE_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId,
  });

  return { balance: data ?? 0n, refetch, isError, isLoading };
}

export function useUserLock() {
  const { address } = useAccount();
  const vaultAddress = useSetuVaultAddress();

  const { data, refetch } = useReadContract({
    address: vaultAddress,
    abi: SETU_VAULT_ABI,
    functionName: "userLock",
    args: address ? [address] : undefined,
  });

  return {
    lpAmount: data?.[0] ?? 0n,
    unlockTime: data?.[1] ?? 0n,
    refetch,
  };
}

export function useGetUSDCValue() {
  const { address } = useAccount();
  const vaultAddress = useSetuVaultAddress();

  const { data, refetch } = useReadContract({
    address: vaultAddress,
    abi: SETU_VAULT_ABI,
    functionName: "getUSDCValue",
    args: address ? [address] : undefined,
  });

  return { value: data ?? 0n, refetch };
}

export function useGetTimeLeft() {
  const { address } = useAccount();
  const vaultAddress = useSetuVaultAddress();

  const { data, refetch } = useReadContract({
    address: vaultAddress,
    abi: SETU_VAULT_ABI,
    functionName: "getTimeUntilUnlock",
    args: address ? [address] : undefined,
  });

  return { timeLeft: data ?? 0n, refetch };
}

export function useCanWithdraw() {
  const { address } = useAccount();
  const vaultAddress = useSetuVaultAddress();

  const { data, refetch } = useReadContract({
    address: vaultAddress,
    abi: SETU_VAULT_ABI,
    functionName: "isWithdrawReady",
    args: address ? [address] : undefined,
  });

  return { canWithdraw: data ?? false, refetch };
}

export function useBridge() {
  const chainId = useChainId();
  const vaultAddress = useSetuVaultAddress();
  const usdcAddress = USDC_ADDRESSES[chainId];
  const { writeContractAsync, isPending, error } = useWriteContract();

  const bridge = async (amount: string) => {
    if (!vaultAddress) throw new Error("Unsupported network. Switch to Base Sepolia or Ethereum Sepolia.");
    if (!usdcAddress) throw new Error("USDC address not found for this network.");
    
    const amountWei = parseUnits(amount, USDC_DECIMALS);
    
    // Step 1: Approve USDC spending
    await writeContractAsync({
      address: usdcAddress,
      abi: ERC20_APPROVE_ABI,
      functionName: "approve",
      args: [vaultAddress, amountWei],
      gas: 100000n,
    });
    
    // Step 2: Bridge tokens
    return writeContractAsync({
      address: vaultAddress,
      abi: SETU_VAULT_ABI,
      functionName: "bridge",
      args: [amountWei],
      gas: 500000n,
    });
  };

  return { bridge, isPending, error };
}

export function useDepositLP() {
  const chainId = useChainId();
  const vaultAddress = useSetuVaultAddress();
  const usdcAddress = USDC_ADDRESSES[chainId];
  const { writeContractAsync, isPending, error } = useWriteContract();

  const depositLP = async (amount: string, days: number) => {
    if (!vaultAddress) throw new Error("Unsupported network. Switch to Base Sepolia or Ethereum Sepolia.");
    if (!usdcAddress) throw new Error("USDC address not found for this network.");
    
    const amountWei = parseUnits(amount, USDC_DECIMALS);
    
    // Step 1: Approve USDC spending
    await writeContractAsync({
      address: usdcAddress,
      abi: ERC20_APPROVE_ABI,
      functionName: "approve",
      args: [vaultAddress, amountWei],
      gas: 100000n,
    });
    
    // Step 2: Deposit LP
    return writeContractAsync({
      address: vaultAddress,
      abi: SETU_VAULT_ABI,
      functionName: "depositLP",
      args: [amountWei, BigInt(days)],
      gas: 500000n,
    });
  };

  return { depositLP, isPending, error };
}

export function useWithdrawLP() {
  const vaultAddress = useSetuVaultAddress();
  const { writeContractAsync, isPending, error } = useWriteContract();

  const withdrawLP = async () => {
    if (!vaultAddress) throw new Error("Unsupported network. Switch to Base Sepolia or Ethereum Sepolia.");
    return writeContractAsync({
      address: vaultAddress,
      abi: SETU_VAULT_ABI,
      functionName: "withdrawLP",
      gas: 300000n,
    });
  };

  return { withdrawLP, isPending, error };
}