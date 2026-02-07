"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowDown, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBridge, useUSDCBalance } from "@/hooks/use-setu-vault";
import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { formatUSDC } from "@/lib/utils";
import { baseSepolia, sepolia } from "wagmi/chains";

const CHAINS = [
  { id: baseSepolia.id, name: "Base Sepolia" },
  { id: sepolia.id, name: "Ethereum Sepolia" },
] as const;

const TOKENS = [{ id: "usdc", symbol: "USDC" }] as const;

function getChainName(id: number) {
  return CHAINS.find((c) => c.id === id)?.name ?? "Select chain";
}

export function BridgeTab() {
  const chainId = useChainId();
  const { address } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { bridge, isPending } = useBridge();

  const [fromChainId, setFromChainId] = useState<number>(chainId ?? baseSepolia.id);
  const [toChainId, setToChainId] = useState<number>(sepolia.id);
  const [fromToken, setFromToken] = useState<string>("usdc");
  const [toToken, setToToken] = useState<string>("usdc");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  const { balance: fromBalance } = useUSDCBalance(fromChainId);
  const { balance: toBalance } = useUSDCBalance(toChainId);

  useEffect(() => {
    if (chainId && CHAINS.some((c) => c.id === chainId)) {
      setFromChainId(chainId);
    }
  }, [chainId]);

  const handleFromChainChange = async (value: string) => {
    const id = Number(value);
    setFromChainId(id);
    if (address && id !== chainId) {
      try {
        await switchChainAsync?.({ chainId: id });
        toast.success(`Switched to ${getChainName(id)}`);
      } catch (e) {
        toast.error("Failed to switch network");
      }
    }
  };

  const handleToChainChange = (value: string) => {
    setToChainId(Number(value));
  };

  const swapFromTo = () => {
    setFromChainId(toChainId);
    setToChainId(fromChainId);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const handleTransfer = async () => {
    if (!address) {
      toast.error("Connect your wallet first");
      return;
    }
    if (chainId !== fromChainId) {
      try {
        await switchChainAsync?.({ chainId: fromChainId });
      } catch (e) {
        toast.error("Switch to the selected network first");
        return;
      }
    }
    const num = parseFloat(fromAmount);
    if (!fromAmount || isNaN(num) || num <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    toast.loading("Transaction Pending...", { id: "bridge-pending" });
    try {
      const hash = await bridge(fromAmount);
      toast.dismiss("bridge-pending");
      toast.success("Bridge Initiated", {
        description: `Tx: ${hash?.slice(0, 10)}...`,
        id: "bridge-success",
      });
      setFromAmount("");
      setToAmount("");
    } catch (e) {
      toast.dismiss("bridge-pending");
      toast.error("Bridge failed", {
        description: e instanceof Error ? e.message : "Transaction reverted",
        id: "bridge-error",
      });
    }
  };

  const fromChainName = getChainName(fromChainId);
  const toChainName = getChainName(toChainId);

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    setToAmount(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex justify-center"
    >
      <div className="w-full max-w-md space-y-5">
        <Card className="overflow-hidden rounded-2xl border border-border shadow-sm">
          <CardContent className="p-0">
            {/* From */}
            <div className="rounded-t-2xl bg-muted/30 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  From
                </span>
                <Select
                  value={String(fromChainId)}
                  onValueChange={handleFromChainChange}
                >
                  <SelectTrigger className="h-8 w-[160px] gap-1.5 rounded-lg border-border bg-background/80 text-sm font-medium shadow-sm">
                    <SelectValue placeholder="Select chain" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHAINS.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between gap-4">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  className="h-14 max-w-[180px] border-0 bg-transparent p-0 text-3xl font-semibold tabular-nums placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
                  min="0"
                  step="any"
                />
                <Select value={fromToken} onValueChange={setFromToken}>
                  <SelectTrigger className="h-14 min-w-[172px] justify-start gap-3 rounded-xl border border-border bg-background/90 px-3 py-2 shadow-sm [&>span:first-child]:line-clamp-none [&>span:first-child]:flex [&>span:first-child]:min-w-0 [&>span:first-child]:flex-1">
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <CircleDollarSign className="h-6 w-6 shrink-0 text-muted-foreground" />
                      <span className="flex min-w-0 flex-1 flex-col items-end overflow-hidden text-right">
                        <span className="block truncate text-sm font-semibold">USDC</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {fromChainName}
                        </span>
                      </span>
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {TOKENS.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <span className="flex items-center gap-2">
                          <CircleDollarSign className="h-4 w-4" />
                          {t.symbol} · {fromChainName}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="mt-2 text-right text-xs text-muted-foreground">
                Bal: {address ? formatUSDC(fromBalance) : "—"}
              </p>
            </div>

            {/* Swap direction */}
            <div className="relative flex justify-center py-1">
              <button
                type="button"
                onClick={swapFromTo}
                className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-card shadow-md transition-all hover:scale-105 hover:bg-muted/80 active:scale-95"
                aria-label="Swap from and to"
              >
                <ArrowDown className="h-5 w-5 text-foreground" />
              </button>
            </div>

            {/* To */}
            <div className="rounded-b-2xl bg-muted/20 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  To
                </span>
                <Select value={String(toChainId)} onValueChange={handleToChainChange}>
                  <SelectTrigger className="h-8 w-[160px] gap-1.5 rounded-lg border-border bg-background/80 text-sm font-medium shadow-sm">
                    <SelectValue placeholder="Select chain" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHAINS.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between gap-4">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={toAmount}
                  readOnly
                  className="h-14 max-w-[180px] border-0 bg-transparent p-0 text-3xl font-semibold tabular-nums text-muted-foreground focus-visible:ring-0"
                />
                <Select value={toToken} onValueChange={setToToken}>
                  <SelectTrigger className="h-14 min-w-[172px] justify-start gap-3 rounded-xl border border-border bg-background/90 px-3 py-2 shadow-sm [&>span:first-child]:line-clamp-none [&>span:first-child]:flex [&>span:first-child]:min-w-0 [&>span:first-child]:flex-1">
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <CircleDollarSign className="h-6 w-6 shrink-0 text-muted-foreground" />
                      <span className="flex min-w-0 flex-1 flex-col items-end overflow-hidden text-right">
                        <span className="block truncate text-sm font-semibold">USDC</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {toChainName}
                        </span>
                      </span>
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {TOKENS.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <span className="flex items-center gap-2">
                          <CircleDollarSign className="h-4 w-4" />
                          {t.symbol} · {toChainName}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="mt-2 text-right text-xs text-muted-foreground">
                Bal: {address ? formatUSDC(toBalance) : "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleTransfer}
          disabled={!address || isPending}
          className="h-12 w-full rounded-xl text-base font-semibold shadow-sm transition-all hover:opacity-95 active:scale-[0.99]"
          style={{
            background: "var(--color-foreground)",
            color: "var(--color-background)",
          }}
        >
          {isPending ? "Confirming..." : "Bridge"}
        </Button>
      </div>
    </motion.div>
  );
}
