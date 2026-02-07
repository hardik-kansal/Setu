import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia, sepolia } from "wagmi/chains";
import { http } from "wagmi";

export const config = getDefaultConfig({
  appName: "Setu Bridge",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [baseSepolia, sepolia],
  ssr: true,
  transports: {
    [baseSepolia.id]: http(),
    [sepolia.id]: http(),
  },
});
