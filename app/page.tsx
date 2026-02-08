"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/dashboard/header";
import { BridgeTab } from "@/components/dashboard/bridge-tab";
import { YieldTab } from "@/components/dashboard/yield-tab";
import { SystemStatus } from "@/components/dashboard/system-status";
import { RebalancerDashboard } from "@/components/dashboard/rebalancer-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightLeft, TrendingUp, Bot } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("bridge");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Dashboard
              </h1>
              <p className="mt-1 text-muted-foreground">
                Bridge USDC and manage LP positions on Base Sepolia & Ethereum Sepolia.
              </p>
            </motion.div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="glass mb-6 inline-flex h-12 w-full max-w-2xl p-1 bg-muted/50 border border-indigo-500/20">
                <TabsTrigger
                  value="bridge"
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg px-6"
                >
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Bridge
                </TabsTrigger>
                <TabsTrigger
                  value="yield"
                  className="data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg px-6"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Yield
                </TabsTrigger>
                <TabsTrigger
                  value="rebalancer"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg px-6"
                >
                  <Bot className="mr-2 h-4 w-4" />
                  AI Rebalancer
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="bridge" className="mt-0">
                  <BridgeTab />
                </TabsContent>
                <TabsContent value="yield" className="mt-0">
                  <YieldTab />
                </TabsContent>
                <TabsContent value="rebalancer" className="mt-0">
                  <RebalancerDashboard />
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </div>

          {activeTab !== "rebalancer" && (
            <aside className="w-full lg:w-[340px] shrink-0">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="lg:sticky lg:top-24"
              >
                <SystemStatus />
              </motion.div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
