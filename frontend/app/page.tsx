"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { getContract } from "../libs/eth";
import RewardCard from "@/components/RewardCard";

export default function Home() {
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");

  async function stakeETH() {
    try {
      setLoading(true);
      setStatus("Connecting wallet...");

      const contract = await getContract();

      setStatus("Sending transaction...");

      const tx = await contract.stake({
        value: ethers.parseEther(amount || "0")
      });

      setStatus("Waiting for confirmation...");
      await tx.wait();

      setStatus("Staked successfully");
      setAmount("");
    } catch (err: any) {
      console.error(err);
      setStatus(err?.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950 text-white flex items-center justify-center p-6">

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">

        <h1 className="text-2xl font-bold text-center">
          ETH Staking DApp
        </h1>

        <p className="text-gray-400 text-sm text-center mt-2">
          Stake ETH and earn rewards over time
        </p>

        {/* INPUT */}
        <input
          type="number"
          placeholder="Enter ETH amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full mt-6 p-3 rounded-lg bg-black/40 border border-white/10 outline-none"
        />

        {/* BUTTON */}
        <button
          onClick={stakeETH}
          disabled={loading}
          className="w-full mt-4 bg-purple-600 hover:bg-purple-700 transition py-3 rounded-lg font-semibold"
        >
          {loading ? "Processing..." : "Stake ETH"}
        </button>

        {/* STATUS */}
        {status && (
          <p className="text-center text-sm text-gray-300 mt-4">
            {status}
          </p>
        )}

        {/* Rewards */}
        <RewardCard />
      </div>
    </div>
  );
}