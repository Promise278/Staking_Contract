import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";
import { http, fallback } from "viem";

export const config = getDefaultConfig({
  appName: "GreenStake",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "YOUR_PROJECT_ID",
  chains: [sepolia],
  ssr: true,
  transports: {
    // Multiple public Sepolia RPCs as fallbacks — first one that responds wins
    [sepolia.id]: fallback([
      http("https://ethereum-sepolia-rpc.publicnode.com"),
      http("https://sepolia.gateway.tenderly.co"),
      http("https://rpc.sepolia.org"),
      http(), // wagmi's built-in default as last resort
    ]),
  },
});
