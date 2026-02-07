"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_LOGS = [
  "[Setu Manager] Detecting bridge intent...",
  "[Setu Manager] Optimizing rebalance path...",
  "[Setu Manager] Unlocking funds on Polygon Amoy...",
  "[Setu Manager] Cross-chain state synced.",
  "[Setu Manager] LP position health check passed.",
  "[Setu Manager] Yield accrual updated.",
  "[Setu Manager] Monitoring Arbitrum Sepolia → Polygon Amoy.",
  "[Setu Manager] No pending rebalance required.",
  "[Setu Manager] Aave supply balance verified.",
  "[Setu Manager] Ready for next bridge request.",
];

const COLORS = ["text-emerald-400", "text-cyan-400", "text-indigo-400", "text-teal-400"];

export function SystemStatus() {
  const [logs, setLogs] = useState<{ text: string; id: number; color: string }[]>([]);
  const nextIdRef = useRef(0);

  useEffect(() => {
    if (logs.length >= 8) return;
    const interval = setInterval(() => {
      const id = nextIdRef.current++;
      const idx = id % MOCK_LOGS.length;
      const colorIdx = id % COLORS.length;
      setLogs((prev) => [
        ...prev.slice(-7),
        { text: MOCK_LOGS[idx], id, color: COLORS[colorIdx] },
      ]);
    }, 2000 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, [logs.length]);

  return (
    <div className="flex h-full flex-col rounded-xl glass-card border border-indigo-500/20 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-indigo-500/20 bg-background/40 px-4 py-3">
        <Cpu className="h-4 w-4 text-indigo-400" />
        <span className="text-sm font-semibold text-foreground">System Status</span>
        <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>
      <div className="terminal-scroll flex-1 overflow-y-auto p-3 font-mono text-xs min-h-[200px] bg-black/30">
        <div className="space-y-1">
          <div className="text-muted-foreground/80">Setu AI Agent (Manager) — logs</div>
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={`log-${log.id}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={cn("flex items-start gap-2", log.color)}
              >
                <ChevronRight className="h-3 w-3 shrink-0 mt-0.5 text-muted-foreground" />
                <span>{log.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          <motion.div
            key="cursor"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-indigo-400/80"
          >
            _
          </motion.div>
        </div>
      </div>
    </div>
  );
}
