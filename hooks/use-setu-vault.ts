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

export function useSetuVaultAddress() {
  const chainId = useChainId();
  return (SETU_VAULT_ADDRESSES as Record<number, `0x${string}`>)[chainId];
}

/** USDC balance for the connected wallet on a specific chain (for Bridge tab). */
export function useUSDCBalance(chainId: number) {
  const { address } = useAccount();
  const usdcAddress = USDC_ADDRESSES[chainId];

  const { data, refetch } = useReadContract({
    address: usdcAddress,
    abi: ERC20_BALANCE_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId,
  });

  return { balance: data ?? 0n, refetch };
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
    functionName: "getTimeLeft",
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
    functionName: "canWithdraw",
    args: address ? [address] : undefined,
  });

  return { canWithdraw: data ?? false, refetch };
}

export function useBridge() {
  const vaultAddress = useSetuVaultAddress();
  const { writeContractAsync, isPending, error } = useWriteContract();

  const bridge = async (amount: string) => {
    if (!vaultAddress) throw new Error("Unsupported network. Switch to Base Sepolia or Ethereum Sepolia.");
    const amountWei = parseUnits(amount, USDC_DECIMALS);
    return writeContractAsync({
      address: vaultAddress,
      abi: SETU_VAULT_ABI,
      functionName: "bridge",
      args: [amountWei],
    });
  };

  return { bridge, isPending, error };
}

export function useDepositLP() {
  const vaultAddress = useSetuVaultAddress();
  const { writeContractAsync, isPending, error } = useWriteContract();

  const depositLP = async (amount: string, days: number) => {
    if (!vaultAddress) throw new Error("Unsupported network. Switch to Base Sepolia or Ethereum Sepolia.");
    const amountWei = parseUnits(amount, USDC_DECIMALS);
    return writeContractAsync({
      address: vaultAddress,
      abi: SETU_VAULT_ABI,
      functionName: "depositLP",
      args: [amountWei, BigInt(days)],
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
    });
  };

  return { withdrawLP, isPending, error };
}
