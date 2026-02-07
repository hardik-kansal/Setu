"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Lock, TrendingUp, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  useUserLock,
  useGetUSDCValue,
  useGetTimeLeft,
  useCanWithdraw,
  useDepositLP,
  useWithdrawLP,
} from "@/hooks/use-setu-vault";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { formatUSDC, formatTimeLeft } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { arbitrumSepolia, sepolia } from "wagmi/chains";

const LOCK_DAYS = [1, 3, 7] as const;

const DEPOSIT_CHAINS = [
  { id: arbitrumSepolia.id, name: "Arbitrum Sepolia" },
  { id: sepolia.id, name: "Ethereum Sepolia" },
] as const;

export function YieldTab() {
  const chainId = useChainId();
  const { address } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { lpAmount, unlockTime, refetch: refetchLock } = useUserLock();
  const { value: usdcValue, refetch: refetchValue } = useGetUSDCValue();
  const { timeLeft, refetch: refetchTime } = useGetTimeLeft();
  const { canWithdraw, refetch: refetchCan } = useCanWithdraw();
  const { depositLP, isPending: depositPending } = useDepositLP();
  const { withdrawLP, isPending: withdrawPending } = useWithdrawLP();

  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [selectedLockDays, setSelectedLockDays] = useState<number | null>(null);
  const [selectedDepositChainId, setSelectedDepositChainId] = useState<number>(chainId ?? arbitrumSepolia.id);
  const [pendingDeposit, setPendingDeposit] = useState<{ amount: string; days: number } | null>(null);

  useEffect(() => {
    if (!address) return;
    const interval = setInterval(refetchTime, 1000);
    return () => clearInterval(interval);
  }, [address, refetchTime]);

  useEffect(() => {
    if (depositOpen && chainId) {
      setSelectedDepositChainId(chainId);
    }
  }, [depositOpen, chainId]);

  // After chain switch, run the pending deposit (so vault address is for the new chain)
  useEffect(() => {
    if (!pendingDeposit || chainId !== selectedDepositChainId || !address) return;
    const { amount, days } = pendingDeposit;
    setPendingDeposit(null);
    toast.loading("Transaction Pending...", { id: "deposit-pending" });
    depositLP(amount, days)
      .then(() => {
        toast.dismiss("deposit-pending");
        toast.success("Deposit successful", { id: "deposit-success" });
        setDepositOpen(false);
        setDepositAmount("");
        setSelectedLockDays(null);
        refetchLock();
        refetchValue();
        refetchTime();
        refetchCan();
      })
      .catch((e) => {
        toast.dismiss("deposit-pending");
        toast.error("Deposit failed", {
          description: e instanceof Error ? e.message : "Transaction reverted",
          id: "deposit-error",
        });
      });
  }, [pendingDeposit, chainId, selectedDepositChainId, address]);

  const handleDeposit = async () => {
    if (!address) {
      toast.error("Connect your wallet first");
      return;
    }
    if (selectedLockDays == null) {
      toast.error("Choose a lock period (1, 3, or 7 days)");
      return;
    }
    const num = parseFloat(depositAmount);
    if (!depositAmount || isNaN(num) || num <= 0) {
      toast.error("Enter a valid USDC amount");
      return;
    }

    if (chainId !== selectedDepositChainId) {
      try {
        await switchChainAsync?.({ chainId: selectedDepositChainId });
        setPendingDeposit({ amount: depositAmount, days: selectedLockDays });
      } catch (e) {
        toast.error("Switch to the selected network first");
      }
      return;
    }

    toast.loading("Transaction Pending...", { id: "deposit-pending" });
    try {
      await depositLP(depositAmount, selectedLockDays);
      toast.dismiss("deposit-pending");
      toast.success("Deposit successful", { id: "deposit-success" });
      setDepositOpen(false);
      setDepositAmount("");
      setSelectedLockDays(null);
      refetchLock();
      refetchValue();
      refetchTime();
      refetchCan();
    } catch (e) {
      toast.dismiss("deposit-pending");
      toast.error("Deposit failed", {
        description: e instanceof Error ? e.message : "Transaction reverted",
        id: "deposit-error",
      });
    }
  };

  const handleWithdraw = async () => {
    if (!address || !canWithdraw) return;
    toast.loading("Transaction Pending...", { id: "withdraw-pending" });
    try {
      await withdrawLP();
      toast.dismiss("withdraw-pending");
      toast.success("Withdraw successful", { id: "withdraw-success" });
      refetchLock();
      refetchValue();
      refetchCan();
    } catch (e) {
      toast.dismiss("withdraw-pending");
      toast.error("Withdraw failed", {
        description: e instanceof Error ? e.message : "Transaction reverted",
        id: "withdraw-error",
      });
    }
  };

  const hasLock = lpAmount > 0n;
  const midnightCountdown = formatTimeLeft(timeLeft);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card border-teal-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Lock className="h-4 w-4 text-teal-400" />
              Total Locked (zLP)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-teal-300">
              {lpAmount > 0n ? lpAmount.toString() : "0"}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card border-teal-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-teal-400" />
              Current Value (USDC)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-teal-300">
              ${formatUSDC(usdcValue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Midnight Countdown */}
      {hasLock && (
        <Card className="glass-card border-indigo-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-400" />
              Unlock countdown (Midnight UTC)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono font-bold text-indigo-300">
              {midnightCountdown}
            </p>
            <Progress
              value={
                canWithdraw ? 100 : (unlockTime > 0n && timeLeft > 0n ? 50 : 0)
              }
              className="mt-2 h-2 bg-teal-500/20 [&>div]:bg-teal-500"
            />
          </CardContent>
        </Card>
      )}

      {/* Deposit LP — trigger button + dialog */}
      <Card className="glass-card border-indigo-500/20">
        <CardHeader>
          <CardTitle>Deposit LP</CardTitle>
          <CardDescription>
            Lock USDC for 1, 3, or 7 days. Choose one lock period per deposit. Earn yield until unlock at midnight UTC.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setDepositOpen(true)}
            disabled={!address}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Deposit
          </Button>
        </CardContent>
      </Card>

      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="glass-card border-border bg-background/95">
          <DialogHeader>
            <DialogTitle>Deposit LP</DialogTitle>
            <DialogDescription>
              Enter amount and choose one lock period. Only one lock can be selected per deposit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Chain
              </label>
              <Select
                value={String(selectedDepositChainId)}
                onValueChange={(v) => setSelectedDepositChainId(Number(v))}
              >
                <SelectTrigger className="w-full border-border bg-background/50">
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent>
                  {DEPOSIT_CHAINS.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Amount (USDC)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="bg-background/50 border-border"
                min="0"
                step="any"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Lock period (choose one)
              </label>
              <div className="flex flex-wrap gap-2">
                {LOCK_DAYS.map((days) => (
                  <Button
                    key={days}
                    type="button"
                    variant="outline"
                    className={cn(
                      "border-indigo-500/40 transition-colors",
                      selectedLockDays === days
                        ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/50"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => setSelectedLockDays(days)}
                    disabled={depositPending}
                  >
                    {days} Day{days > 1 ? "s" : ""}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDepositOpen(false)}
              disabled={depositPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              disabled={
                !address ||
                depositPending ||
                selectedLockDays == null ||
                !depositAmount ||
                parseFloat(depositAmount) <= 0
              }
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {depositPending ? "Confirming..." : "Deposit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw */}
      <Card className="glass-card border-teal-500/20">
        <CardHeader>
          <CardTitle>Withdraw LP</CardTitle>
          <CardDescription>
            Withdraw your USDC after the lock period ends (midnight UTC).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleWithdraw}
            disabled={!address || !canWithdraw || withdrawPending}
            variant="secondary"
            className="bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-50"
          >
            {withdrawPending ? "Confirming..." : "Withdraw"}
          </Button>
          {!canWithdraw && hasLock && (
            <p className="mt-2 text-sm text-muted-foreground">
              Unlock countdown: {midnightCountdown}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
