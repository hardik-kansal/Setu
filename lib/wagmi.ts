import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrumSepolia, polygonAmoy } from "wagmi/chains";
import { http } from "wagmi";

export const config = getDefaultConfig({
  appName: "Setu Bridge",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [arbitrumSepolia, polygonAmoy],
  ssr: true,
  transports: {
    [arbitrumSepolia.id]: http(),
    [polygonAmoy.id]: http(),
  },
});
