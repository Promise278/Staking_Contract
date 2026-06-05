'use client';

import { useState, useEffect } from 'react';
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';

interface Stake {
  amount: bigint;
  timestamp: bigint;
  lastClaimedAt: bigint;
  active: boolean;
  rewardEarned?: string;
}

export default function Home() {

    return (
    <main className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <header className="max-w-6xl mx-auto flex-col md:flex-row flex justify-between items-start md:items-center border-b border-slate-800 pb-6 mb-8">
        <h1 className="text-2xl font-bold tracking-tight pb-2 sm:pb-0 text-blue-400">Decentralized Staking</h1>
          <button className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 md:px-6 md:py-2.5 rounded-lg text-sm font-semibold transition">
            Connect wallet
          </button>
      </header>

      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Network and Validation Alerts */}
          <div className="md:col-span-3 bg-red-950 border border-red-800 text-red-200 p-4 rounded-xl flex justify-between items-center">
            <span>Network Mismatch detected. Contract operates exclusively on the Sepolia network.</span>
            <button className="bg-red-800 hover:bg-red-700 px-4 py-1.5 rounded-lg text-xs font-bold transition">
              Switch to Sepolia
            </button>
          </div>

        {/* Total Platform Metrics Card */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex flex-col justify-between">
          <p className="text-slate-400 text-sm font-medium">Total Pool Liquidity Staked</p>
          <p className="text-4xl font-extrabold text-white my-2"> <span className="text-xl text-blue-400">ETH</span></p>
        </div>

        {/* Interaction Form Card */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl md:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">Stake Native Sepolia ETH</h2>
          <form className="flex flex-col md:flex-row gap-4">
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 1.5 ETH"
              className="bg-slate-900 border border-slate-700 rounded-xl p-3 grow focus:outline-none focus:border-blue-500 disabled:opacity-50 text-white font-medium"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 md:px-8 mx-auto px-4 py-1 md:py-2 rounded-xl font-semibold md:font-bold transition text-sm whitespace-nowrap"
            > 
              Deposit ETH
            </button>
          </form>
        </div>
      </section>

      {/* User Portfolio Positions Table & History Logs */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl md:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">Your Active Staking Positions</h2>
          
            <p className="text-slate-500 text-sm py-4">No active stake allocation found for this public key.</p>
            <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Position</p>
                    <p className="text-lg font-bold text-white">ETH</p>
                    <p className="text-xs text-green-400 font-medium">Claimable Rewards: RWD</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-4 py-2 rounded-lg text-xs font-bold transition">
                      Claim
                    </button>
                    <button className="bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 px-4 py-2 rounded-lg text-xs font-bold transition">
                      Withdraw Position
                    </button>
                  </div>
                </div>
            </div>
        </div>

        {/* Transaction History Pipeline */}
        {/* <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">Local Action Log</h2>
          {history.length === 0 ? (
            <p className="text-slate-500 text-sm">No transactions logged in this session runtime.</p>
          ) : (
            // <ul className="space-y-2 font-mono text-xs">
            //   {history.map((log, i) => (
            //     <li key={i} className="bg-slate-900 p-2 rounded-lg border border-slate-700 text-slate-300">
            //       <span className="text-green-500 mr-1.5">✓</span> {log}
            //     </li>
            //   ))}
            // </ul>
          )}
        </div> */}
      </section>
    </main>
  );
}