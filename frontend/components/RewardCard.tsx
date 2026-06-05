"use client";

import { useState } from "react";
import { getContract } from "../libs/eth";
import { ethers } from "ethers";

export default function RewardCard() {
  const [tokenId, setTokenId] = useState<string>("");
  const [reward, setReward] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function fetchReward() {
    try {
      setLoading(true);

      const contract = await getContract();

      const result: bigint = await contract.calculateReward(tokenId);

      const formatted = ethers.formatEther(result);

      setReward(formatted);
    } catch (err) {
      console.error(err);
      setReward("Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 bg-white/5 border border-white/10 p-4 rounded-xl">

      <h2 className="font-semibold mb-3">Check Reward</h2>

      <input
        placeholder="Token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        className="w-full p-2 bg-black/40 border border-white/10 rounded mb-3"
      />

      <button
        onClick={fetchReward}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded"
      >
        {loading ? "Loading..." : "Get Reward"}
      </button>

      {reward && (
        <p className="mt-3 text-green-400">
          Reward: {reward} ETH
        </p>
      )}

    </div>
  );
}