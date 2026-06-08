// "use client";

// import { useState } from "react";
// import { ethers } from "ethers";

// const CONTRACT_ADDRESS =
//   "0xFcA9f84E9B95F7E7Fc9f31326108e4e6A4F62dA2";

// const ABI = [
//   "function stake() payable"
// ];

// declare global {
//   interface Window {
//     ethereum?: any;
//   }
// }

// export default function Home() {
//   const [account, setAccount] =
//     useState("");

//   const [balance, setBalance] =
//     useState("0");

//   const [amount, setAmount] =
//     useState("");

//   const [loading, setLoading] =
//     useState(false);

//   const [error, setError] =
//     useState("");

//   async function connectWallet() {
//   try {
//     setError("");

//     if (typeof window === "undefined") {
//       return;
//     }

//     if (!window.ethereum) {
//       throw new Error(
//         "MetaMask is not installed"
//       );
//     }

//     const provider =
//       new ethers.BrowserProvider(
//         window.ethereum
//       );

//     const accounts =
//       await provider.send(
//         "eth_requestAccounts",
//         []
//       );

//     if (!accounts.length) {
//       throw new Error(
//         "No account selected"
//       );
//     }

//     const signer =
//       await provider.getSigner();

//     const address =
//       await signer.getAddress();

//     const balance =
//       await provider.getBalance(
//         address
//       );

//     setAccount(address);

//     setBalance(
//       ethers.formatEther(balance)
//     );

//     console.log(
//       "Connected:",
//       address
//     );
//   } catch (error: any) {
//     console.error(error);

//     setError(
//       error?.message ||
//         "Failed to connect wallet"
//     );
//   }
// }

//   async function handleStake() {
//     try {
//       if (!amount)
//         return alert(
//           "Enter amount"
//         );

//       setLoading(true);

//       const provider =
//         new ethers.BrowserProvider(
//           window.ethereum
//         );

//       const signer =
//         await provider.getSigner();

//       const contract =
//         new ethers.Contract(
//           CONTRACT_ADDRESS,
//           ABI,
//           signer
//         );

//       const tx =
//         await contract.stake({
//           value:
//             ethers.parseEther(
//               amount
//             ),
//         });

//       await tx.wait();

//       alert(
//         "Stake successful!"
//       );

//       const newBalance =
//         await provider.getBalance(
//           account
//         );

//       setBalance(
//         ethers.formatEther(
//           newBalance
//         )
//       );

//       setAmount("");
//     } catch (err) {
//       console.error(err);

//       alert("Stake failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   if (!account) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-[#f8faf7] p-5">

//         <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

//           <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">

//             <svg
//               className="h-8 w-8 text-green-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"
//               />
//             </svg>

//           </div>

//           <h1 className="text-center text-3xl font-bold text-gray-900">
//             GreenStake
//           </h1>

//           <p className="mt-3 text-center text-gray-500">
//             Connect MetaMask to start staking ETH
//             and earning rewards.
//           </p>

//           <button
//             onClick={connectWallet}
//             className="mt-8 w-full rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
//           >
//             Connect MetaMask
//           </button>

//           {error && (
//             <p className="mt-4 text-center text-red-500">
//               {error}
//             </p>
//           )}
//         </div>

//       </div>
//     );
//   }

//   return (
//     <main className="min-h-screen bg-[#f8faf7]">

//       <div className="mx-auto max-w-7xl px-6 py-10">

//         <div className="flex flex-col gap-5 md:flex-row md:justify-between md:items-center">

//           <div>
//             <p className="text-sm uppercase tracking-[0.2em] text-green-700 font-semibold">
//               GreenStake Protocol
//             </p>

//             <h1 className="mt-2 text-5xl font-bold text-gray-900">
//               Stake. Earn. Simple.
//             </h1>

//             <p className="mt-3 text-gray-500">
//               Stake ETH directly on-chain and
//               receive NFT staking positions.
//             </p>
//           </div>

//           <div className="rounded-2xl bg-black px-5 py-3 text-white">
//             {account.slice(0, 6)}...
//             {account.slice(-4)}
//           </div>

//         </div>

//         <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-4">
//           <p className="font-medium text-green-800">
//             Wallet Connected
//           </p>
//         </div>

//         <div className="mt-8 grid gap-6 md:grid-cols-2">

//           <div className="rounded-3xl bg-white p-6 shadow-sm border">

//             <p className="text-gray-500">
//               Wallet Balance
//             </p>

//             <h2 className="mt-2 text-4xl font-bold text-gray-900">
//               {Number(balance).toFixed(4)} ETH
//             </h2>

//           </div>

//           <div className="rounded-3xl bg-white p-6 shadow-sm border">

//             <p className="text-gray-500">
//               APR
//             </p>

//             <h2 className="mt-2 text-4xl font-bold text-green-600">
//               10%
//             </h2>

//           </div>

//         </div>

//         <div className="mt-8 grid gap-6 lg:grid-cols-2">

//           <div className="rounded-3xl bg-white p-6 shadow-sm border">

//             <h2 className="text-xl font-bold text-gray-900">
//               Stake ETH
//             </h2>

//             <p className="mt-1 text-gray-500">
//               Enter amount to stake.
//             </p>

//             <input
//               type="number"
//               value={amount}
//               onChange={(e) =>
//                 setAmount(
//                   e.target.value
//                 )
//               }
//               placeholder="0.01"
//               className="mt-6 w-full rounded-xl border p-3 text-black border-green-500 focus:border-green-200"
//             />

//             <div className="mt-6 rounded-xl bg-gray-50 p-4">

//               <div className="flex justify-between text-gray-800">
//                 <span>APR</span>
//                 <span>10%</span>
//               </div>

//               <div className="mt-2 flex justify-between text-gray-800">
//                 <span>Reward</span>
//                 <span>ETH</span>
//               </div>

//               <div className="mt-2 flex justify-between text-gray-800">
//                 <span>NFT Receipt</span>
//                 <span>✓</span>
//               </div>

//             </div>

//             <button
//               onClick={handleStake}
//               disabled={loading}
//               className="mt-6 w-full rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
//             >
//               {loading
//                 ? "Processing..."
//                 : "Stake ETH"}
//             </button>

//           </div>

//           <div className="rounded-3xl bg-white p-6 shadow-sm border">

//             <h2 className="text-xl font-bold text-gray-900">
//               Your Positions
//             </h2>

//             <p className="text-gray-500">
//               NFT staking positions will appear here.
//             </p>

//             <div className="mt-10 flex h-64 items-center justify-center rounded-2xl border border-dashed">

//               <div className="text-center">

//                 <h3 className="font-semibold">
//                   No Positions Yet
//                 </h3>

//                 <p className="text-sm text-gray-500 mt-2">
//                   Stake ETH to mint your first
//                   staking NFT.
//                 </p>

//               </div>

//             </div>

//           </div>

//         </div>

//       </div>

//     </main>
//   );
// }

"use client";

import { useState, useEffect, useCallback, useMemo, type FormEvent } from "react";
import { ethers } from "ethers";

// ─── Config ────────────────────────────────────────────────────────────────────
const STAKING_ADDRESS = "0xFcA9f84E9B95F7E7Fc9f31326108e4e6A4F62dA2";
const SEPOLIA_CHAIN_ID = "0xaa36a7";
const SEPOLIA_CHAIN_ID_DEC = 11155111;

// ─── ABIs ──────────────────────────────────────────────────────────────────────
const STAKING_ABI = [
  "function stake() external payable",
  "function unstake(uint256 tokenId) external",
  "function claimReward(uint256 tokenId) external",
  "function calculateReward(uint256 tokenId) public view returns (uint256)",
  "function stakes(uint256 tokenId) public view returns (uint256 amount, uint256 startTime, bool withdrawn)",
  "function nft() public view returns (address)",
  "event Staked(address indexed user, uint256 indexed tokenId, uint256 amount)",
  "event Unstaked(address indexed user, uint256 indexed tokenId, uint256 amount, uint256 reward)",
  "event Claimed(address indexed user, uint256 indexed tokenId, uint256 reward)",
];

const NFT_ABI = [
  "function ownerOf(uint256 tokenId) public view returns (address)",
];

// ─── Types ─────────────────────────────────────────────────────────────────────
type StakePosition = {
  tokenId: bigint;
  amount: bigint;
  startTime: bigint;
  withdrawn: boolean;
  reward: bigint;
};

type EIP1193Provider = {
  request<T = unknown>(args: { method: string; params?: unknown[] }): Promise<T>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
  isMetaMask?: boolean;
  isZerion?: boolean;
  isCoinbaseWallet?: boolean;
  providers?: EIP1193Provider[];
};

declare global {
  interface Window { ethereum?: EIP1193Provider; }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getMetaMask(): EIP1193Provider | undefined {
  if (typeof window === "undefined") return undefined;
  const eth = window.ethereum;
  if (!eth) return undefined;
  if (eth.providers?.length) {
    return eth.providers.find(p => p.isMetaMask && !p.isZerion && !p.isCoinbaseWallet);
  }
  if (eth.isMetaMask && !eth.isZerion && !eth.isCoinbaseWallet) return eth;
  return undefined;
}

function formatEth(wei: bigint, dp = 4): string {
  const n = Number(ethers.formatEther(wei));
  return n.toFixed(n < 0.0001 ? 8 : dp);
}

function formatDate(ts: bigint): string {
  if (!ts) return "—";
  return new Date(Number(ts) * 1000).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function shortAddr(a: string) { return `${a.slice(0,6)}…${a.slice(-4)}`; }

function getErrMsg(e: unknown): string {
  if (typeof e === "object" && e !== null) {
    const err = e as Record<string, unknown>;
    if (typeof err.reason === "string") return err.reason;
    if (typeof err.shortMessage === "string") return err.shortMessage;
    if (typeof err.message === "string") {
      const m = err.message as string;
      const match = m.match(/reason="([^"]+)"/);
      if (match) return match[1];
      // user rejected
      if (m.includes("user rejected") || m.includes("User denied")) return "Transaction rejected.";
      return m.slice(0, 140);
    }
  }
  return "Something went wrong.";
}

const LOCK_PERIOD_SECS = 7 * 24 * 60 * 60;

function isUnlocked(pos: StakePosition): boolean {
  return (Math.floor(Date.now() / 1000) - Number(pos.startTime)) >= LOCK_PERIOD_SECS;
}

function timeLeft(pos: StakePosition): string {
  const remaining = LOCK_PERIOD_SECS - (Math.floor(Date.now() / 1000) - Number(pos.startTime));
  if (remaining <= 0) return "Unlocked";
  const d = Math.floor(remaining / 86400);
  const h = Math.floor((remaining % 86400) / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [account,      setAccount]      = useState("");
  const [chainId,      setChainId]      = useState("");
  const [walletBal,    setWalletBal]    = useState(0n);
  const [positions,    setPositions]    = useState<StakePosition[]>([]);
  const [stakeAmt,     setStakeAmt]     = useState("");
  const [pending,      setPending]      = useState("");
  const [notice,       setNotice]       = useState("");
  const [error,        setError]        = useState("");
  const [loadingPos,   setLoadingPos]   = useState(false);
  const [loadingMsg,   setLoadingMsg]   = useState("");

  const rawEth     = getMetaMask();
  const isSepolia  = chainId.toLowerCase() === SEPOLIA_CHAIN_ID;
  const isConnected = Boolean(account);

  const activePos    = useMemo(() => positions.filter(p => !p.withdrawn), [positions]);
  const totalStaked  = useMemo(() => activePos.reduce((s,p) => s + p.amount, 0n), [activePos]);
  const totalRewards = useMemo(() => activePos.reduce((s,p) => s + p.reward, 0n), [activePos]);

  // ── Provider helpers ──────────────────────────────────────────────────────
  function getProvider() {
    if (!rawEth) throw new Error("MetaMask not found.");
    return new ethers.BrowserProvider(rawEth as unknown as ethers.Eip1193Provider, {
      chainId: SEPOLIA_CHAIN_ID_DEC,
      name: "sepolia",
    });
  }

  async function getSigner() { return getProvider().getSigner(); }

  // ── Balance ───────────────────────────────────────────────────────────────
  const refreshBalance = useCallback(async () => {
    if (!account) return;
    try {
      const bal = await getProvider().getBalance(account);
      setWalletBal(bal);
    } catch { /* silent */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, rawEth]);

  // ── Load positions via past Staked events ─────────────────────────────────
  //
  // Strategy:
  //   1. Query all Staked(user, tokenId, amount) events for this wallet
  //      → gives us every tokenId this user ever staked
  //   2. For each tokenId, call stakes(tokenId) on the staking contract
  //      → gets amount, startTime, withdrawn
  //   3. Check NFT ownerOf(tokenId) to confirm they still own it
  //      (burned NFTs will revert ownerOf — that means unstaked, skip it)
  //   4. Call calculateReward(tokenId) for live reward
  //
  const refreshPositions = useCallback(async () => {
    if (!account || !isSepolia) return;
    setLoadingPos(true);
    setLoadingMsg("Scanning blockchain for your stakes…");
    setError("");

    try {
      const provider = getProvider();
      const staking  = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, provider);
      const nftAddr: string = await staking.nft();
      const nft = new ethers.Contract(nftAddr, NFT_ABI, provider);

      // 1. Get all Staked events for this user (from block 0 to latest)
      setLoadingMsg("Fetching your staking history…");
      const filter = staking.filters.Staked(account);
      const events = await staking.queryFilter(filter, 0, "latest");

      if (events.length === 0) {
        setPositions([]);
        setLoadingPos(false);
        setLoadingMsg("");
        return;
      }

      // 2. Get unique tokenIds from events
      const tokenIds = [
        ...new Set(
          events.map(e => {
            const log = e as ethers.EventLog;
            return (log.args[1] as bigint);
          })
        )
      ];

      setLoadingMsg(`Found ${tokenIds.length} position(s), loading details…`);

      // 3 & 4. Fetch stake info for each tokenId in parallel
      const results = await Promise.allSettled(
        tokenIds.map(async (tokenId): Promise<StakePosition | null> => {
          // Check if NFT still exists (ownerOf reverts if burned)
          try {
            const owner: string = await nft.ownerOf(tokenId);
            // If someone transferred the NFT away, skip it
            if (owner.toLowerCase() !== account.toLowerCase()) return null;
          } catch {
            // ownerOf reverted → NFT burned → already unstaked
            return null;
          }

          // Get stake info from mapping
          const info = await staking.stakes(tokenId);
          if (info.withdrawn) return null;

          // Get live reward
          let reward = 0n;
          try {
            reward = await staking.calculateReward(tokenId);
          } catch { /* reward stays 0 */ }

          return {
            tokenId,
            amount:    info.amount    as bigint,
            startTime: info.startTime as bigint,
            withdrawn: info.withdrawn as boolean,
            reward,
          };
        })
      );

      const active = results
        .filter((r): r is PromiseFulfilledResult<StakePosition | null> => r.status === "fulfilled")
        .map(r => r.value)
        .filter((p): p is StakePosition => p !== null);

      // Sort newest first
      active.sort((a, b) => Number(b.startTime - a.startTime));
      setPositions(active);

    } catch (e) {
      setError("Failed to load positions: " + getErrMsg(e));
    } finally {
      setLoadingPos(false);
      setLoadingMsg("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, isSepolia, rawEth]);

  // ── Switch to Sepolia ─────────────────────────────────────────────────────
  const switchToSepolia = useCallback(async () => {
    if (!rawEth) throw new Error("MetaMask not found.");
    try {
      await rawEth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: SEPOLIA_CHAIN_ID }] });
    } catch (e: unknown) {
      const code = typeof e === "object" && e !== null && "code" in e
        ? Number((e as { code: unknown }).code) : 0;
      if (code !== 4902) throw e;
      await rawEth.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: SEPOLIA_CHAIN_ID,
          chainName: "Sepolia Testnet",
          nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com", "https://rpc.sepolia.org"],
          blockExplorerUrls: ["https://sepolia.etherscan.io"],
        }],
      });
    }
  }, [rawEth]);

  // ── Connect ───────────────────────────────────────────────────────────────
  const connectWallet = useCallback(async () => {
    if (!rawEth) { setError("MetaMask not found. Install it and refresh."); return; }
    setPending("Connecting");
    setError(""); setNotice("");
    try {
      await rawEth.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] });
      const accounts = await rawEth.request<string[]>({ method: "eth_accounts" });
      let cid = await rawEth.request<string>({ method: "eth_chainId" });
      if (cid.toLowerCase() !== SEPOLIA_CHAIN_ID) {
        await switchToSepolia();
        cid = await rawEth.request<string>({ method: "eth_chainId" });
      }
      setChainId(cid);
      setAccount(accounts[0] ?? "");
      setNotice("Wallet connected.");
    } catch (e) {
      setError(getErrMsg(e));
    } finally {
      setPending("");
    }
  }, [rawEth, switchToSepolia]);

  // ── Stake ──────────────────────────────────────────────────────────────────
  const handleStake = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(stakeAmt);
    if (!stakeAmt || isNaN(parsed) || parsed <= 0) { setError("Enter a valid ETH amount."); return; }
    setPending("Staking"); setError(""); setNotice("");
    try {
      const signer  = await getSigner();
      const staking = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, signer);
      const tx      = await staking.stake({ value: ethers.parseEther(stakeAmt) });
      setNotice("Transaction sent — waiting for confirmation…");
      await tx.wait();
      setStakeAmt("");
      setNotice("✓ Staked successfully! Your NFT position is now live.");
      await Promise.all([refreshPositions(), refreshBalance()]);
    } catch (e) { setError(getErrMsg(e)); }
    finally { setPending(""); }
  };

  // ── Claim ──────────────────────────────────────────────────────────────────
  const handleClaim = async (pos: StakePosition) => {
    setPending(`claim-${pos.tokenId}`); setError(""); setNotice("");
    try {
      const signer  = await getSigner();
      const staking = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, signer);
      const tx      = await staking.claimReward(pos.tokenId);
      setNotice("Claim transaction sent…");
      await tx.wait();
      setNotice(`✓ Reward claimed for position #${pos.tokenId}!`);
      await Promise.all([refreshPositions(), refreshBalance()]);
    } catch (e) { setError(getErrMsg(e)); }
    finally { setPending(""); }
  };

  // ── Unstake ────────────────────────────────────────────────────────────────
  const handleUnstake = async (pos: StakePosition) => {
    setPending(`unstake-${pos.tokenId}`); setError(""); setNotice("");
    try {
      const signer  = await getSigner();
      const staking = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, signer);
      const tx      = await staking.unstake(pos.tokenId);
      setNotice("Unstake transaction sent…");
      await tx.wait();
      setNotice(`✓ Unstaked #${pos.tokenId} — ETH + reward returned to your wallet.`);
      await Promise.all([refreshPositions(), refreshBalance()]);
    } catch (e) { setError(getErrMsg(e)); }
    finally { setPending(""); }
  };

  // ── Wallet event listeners ────────────────────────────────────────────────
  useEffect(() => {
    if (!rawEth) return;
    const loadChain = async () => {
      const cid = await rawEth.request<string>({ method: "eth_chainId" });
      setChainId(cid);
    };
    const onAccounts = (...args: unknown[]) => {
      const accs = Array.isArray(args[0]) ? args[0] as string[] : [];
      setAccount(accs[0] ?? "");
      if (!accs[0]) setPositions([]);
    };
    const onChain = (...args: unknown[]) => {
      const cid = String(args[0] ?? "");
      setChainId(cid);
      if (cid.toLowerCase() !== SEPOLIA_CHAIN_ID) setPositions([]);
    };
    void loadChain();
    rawEth.on?.("accountsChanged", onAccounts);
    rawEth.on?.("chainChanged", onChain);
    return () => {
      rawEth.removeListener?.("accountsChanged", onAccounts);
      rawEth.removeListener?.("chainChanged", onChain);
    };
  }, [rawEth]);

  useEffect(() => {
    if (account && isSepolia) {
      void refreshPositions();
      void refreshBalance();
    }
  }, [account, isSepolia, refreshPositions, refreshBalance]);

  // ────────────────────────────────────────────────────────────────────────────
  // CSS
  // ────────────────────────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', system-ui, sans-serif; background: #080808; color: #fff; -webkit-font-smoothing: antialiased; }

    .card { background: #111; border: 1px solid #1e1e1e; border-radius: 20px; padding: 24px; }

    .btn-primary {
      background: #22c55e; color: #000; border: none; border-radius: 10px;
      padding: 13px 0; width: 100%; font-size: 14px; font-weight: 700;
      cursor: pointer; font-family: inherit; letter-spacing: .03em;
      transition: background .15s, transform .1s, opacity .15s; display: flex;
      align-items: center; justify-content: center; gap: 6px;
    }
    .btn-primary:hover:not(:disabled) { background: #16a34a; transform: translateY(-1px); }
    .btn-primary:active:not(:disabled) { transform: translateY(0); }
    .btn-primary:disabled { opacity: .4; cursor: not-allowed; }

    .btn-ghost {
      background: transparent; color: #22c55e; border: 1px solid #22c55e33;
      border-radius: 8px; padding: 9px 0; font-size: 13px; font-weight: 600;
      cursor: pointer; font-family: inherit; transition: background .15s, border-color .15s;
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
    }
    .btn-ghost:hover:not(:disabled) { background: #22c55e12; border-color: #22c55e66; }
    .btn-ghost:disabled { opacity: .35; cursor: not-allowed; }

    .btn-danger {
      background: transparent; color: #f87171; border: 1px solid #f8717130;
      border-radius: 8px; padding: 9px 0; font-size: 13px; font-weight: 600;
      cursor: pointer; font-family: inherit; transition: background .15s;
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
    }
    .btn-danger:hover:not(:disabled) { background: #f8717112; }
    .btn-danger:disabled { opacity: .35; cursor: not-allowed; }

    .input {
      background: #0d0d0d; border: 1px solid #252525; border-radius: 10px;
      padding: 12px 14px; color: #fff; font-size: 15px;
      font-family: 'DM Mono', monospace; width: 100%; outline: none;
      transition: border-color .2s;
    }
    .input:focus { border-color: #22c55e66; }
    .input::placeholder { color: #333; }
    .input:disabled { opacity: .5; }

    .pill-green { background: #22c55e18; color: #4ade80; border: 1px solid #22c55e28;
      border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; letter-spacing: .06em; }
    .pill-orange { background: #fb923c18; color: #fdba74; border: 1px solid #fb923c28;
      border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; }
    .pill-red { background: #f8717118; color: #fca5a5; border: 1px solid #f8717128;
      border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; }

    .notice { background: #22c55e0e; border: 1px solid #22c55e28; border-radius: 10px;
      padding: 12px 15px; color: #4ade80; font-size: 13px; line-height: 1.5; }
    .err    { background: #f871710e; border: 1px solid #f8717128; border-radius: 10px;
      padding: 12px 15px; color: #fca5a5; font-size: 13px; line-height: 1.5; }
    .warn   { background: #fb923c0e; border: 1px solid #fb923c28; border-radius: 10px;
      padding: 12px 15px; color: #fdba74; font-size: 13px; }

    .mono { font-family: 'DM Mono', monospace; }
    .label { font-size: 11px; color: #484848; font-weight: 600;
      text-transform: uppercase; letter-spacing: .12em; margin-bottom: 8px; }

    .pos-card {
      background: #0d0d0d; border: 1px solid #1c1c1c; border-radius: 14px;
      padding: 18px; display: flex; flex-direction: column; gap: 14px;
      transition: border-color .2s;
    }
    .pos-card:hover { border-color: #2a2a2a; }

    .spinner { display: inline-block; animation: spin 0.9s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    .fade-up { animation: fadeUp .35s ease forwards; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px; margin-bottom: 24px;
    }
    @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 500px) { .stats-grid { grid-template-columns: 1fr 1fr; } }

    .main-grid { display: grid; grid-template-columns: 320px 1fr; gap: 20px; }
    @media (max-width: 780px) { .main-grid { grid-template-columns: 1fr; } }

    .pos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }

    .header {
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid #161616; padding: 14px 20px;
      max-width: 1100px; margin: 0 auto;
    }
    .dashboard { max-width: 1100px; margin: 0 auto; padding: 28px 20px 60px; }

    .loading-overlay {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 52px 20px; gap: 14px; color: #444;
    }
    .loading-ring {
      width: 40px; height: 40px; border: 2px solid #1e1e1e;
      border-top-color: #22c55e; border-radius: 50%;
      animation: spin .8s linear infinite;
    }
  `;

  // ────────────────────────────────────────────────────────────────────────────
  // LANDING
  // ────────────────────────────────────────────────────────────────────────────
  if (!isConnected) return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
        <div className="fade-up" style={{
          width:"100%", maxWidth:"420px", background:"#111",
          border:"1px solid #1e1e1e", borderRadius:"28px", padding:"44px 36px 40px", textAlign:"center",
        }}>
          {/* Icon */}
          <div style={{
            width:68, height:68, borderRadius:"50%", background:"#22c55e0f",
            border:"1px solid #22c55e22", display:"flex", alignItems:"center",
            justifyContent:"center", margin:"0 auto 22px", position:"relative",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <div style={{ position:"absolute", inset:-8, borderRadius:"50%", border:"1px solid #22c55e0e" }}/>
          </div>

          <p style={{ fontSize:10, letterSpacing:".2em", color:"#22c55e", fontWeight:700, textTransform:"uppercase" }}>Sepolia Testnet</p>
          <h1 style={{ fontSize:34, fontWeight:700, letterSpacing:"-.02em", marginTop:10 }}>GreenStake</h1>
          <p style={{ color:"#555", fontSize:14, marginTop:10, lineHeight:1.65 }}>
            Stake ETH, earn 10% APR rewards, and manage your NFT staking positions.
          </p>

          <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:24 }}>
            {[
              ["⬆", "Stake ETH — mint an NFT position"],
              ["🎁", "Claim rewards without unstaking"],
              ["⬇", "Unstake after 7-day lock period"],
            ].map(([icon, label]) => (
              <div key={String(label)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 13px", background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:10 }}>
                <span style={{ fontSize:15 }}>{icon}</span>
                <span style={{ fontSize:13, color:"#666" }}>{label}</span>
              </div>
            ))}
          </div>

          <button className="btn-primary" style={{ marginTop:28 }} onClick={connectWallet} disabled={Boolean(pending)}>
            {pending ? <><span className="spinner">↻</span> {pending}…</> : "Connect MetaMask"}
          </button>
          {error && <p className="err" style={{ marginTop:14, textAlign:"left" }}>{error}</p>}
        </div>
      </div>
    </>
  );

  // ────────────────────────────────────────────────────────────────────────────
  // DASHBOARD
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>

      {/* Header */}
      <div className="header">
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <span style={{ fontWeight:700, fontSize:15, letterSpacing:"-.01em" }}>GreenStake</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {!isSepolia
            ? <button onClick={switchToSepolia} style={{ background:"#fb923c18", color:"#fdba74", border:"1px solid #fb923c28", borderRadius:7, padding:"5px 12px", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                ⚠ Switch to Sepolia
              </button>
            : <span className="pill-green">● Sepolia</span>
          }
          <div className="mono" style={{ background:"#161616", border:"1px solid #222", borderRadius:8, padding:"6px 12px", fontSize:12, color:"#777" }}>
            {shortAddr(account)}
          </div>
        </div>
      </div>

      <div className="dashboard">

        {/* Alerts */}
        {notice && <div className="notice fade-up" style={{ marginBottom:16 }}>{notice}</div>}
        {error  && <div className="err   fade-up" style={{ marginBottom:16 }}>{error}</div>}
        {!isSepolia && <div className="warn" style={{ marginBottom:16 }}>⚠ Wrong network — switch to Sepolia to interact.</div>}

        {/* Stats */}
        <div className="stats-grid">
          {([
            { label:"Wallet Balance",    value:`${formatEth(walletBal)} ETH`,   green:false },
            { label:"Total Staked",      value:`${formatEth(totalStaked)} ETH`, green:true  },
            { label:"Pending Rewards",   value:`${formatEth(totalRewards,6)} ETH`, green:true  },
            { label:"Active Positions",  value:String(activePos.length),        green:false },
          ] as const).map(({ label, value, green }) => (
            <div key={label} className="card">
              <p className="label">{label}</p>
              <p style={{ fontSize:22, fontWeight:700, letterSpacing:"-.02em", color: green ? "#22c55e" : "#fff", marginTop:6 }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="main-grid">

          {/* ── Stake panel ── */}
          <div className="card" style={{ alignSelf:"start" }}>
            <h2 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Stake ETH</h2>
            <form onSubmit={handleStake}>
              <p className="label">Amount (ETH)</p>
              <input
                className="input"
                type="number" step="0.0001" min="0.0001" placeholder="0.01"
                value={stakeAmt}
                onChange={e => setStakeAmt(e.target.value)}
                disabled={!isSepolia || Boolean(pending)}
              />

              <div style={{ margin:"16px 0", background:"#0c0c0c", borderRadius:10, padding:"14px 16px", display:"flex", flexDirection:"column", gap:9 }}>
                {([
                  ["APR",         "10%"],
                  ["Lock Period", "7 days"],
                  ["Reward",      "ETH"],
                  ["Receipt",     "NFT minted"],
                ] as const).map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
                    <span style={{ color:"#484848" }}>{k}</span>
                    <span className="mono" style={{ color:"#777" }}>{v}</span>
                  </div>
                ))}
              </div>

              <button className="btn-primary" type="submit" disabled={!isSepolia || Boolean(pending)}>
                {pending === "Staking"
                  ? <><span className="spinner">↻</span> Confirm in MetaMask…</>
                  : "Stake ETH"
                }
              </button>
            </form>
          </div>

          {/* ── Positions panel ── */}
          <div className="card">
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <div>
                <h2 style={{ fontSize:16, fontWeight:700 }}>Your Positions</h2>
                {activePos.length > 0 && (
                  <p style={{ fontSize:12, color:"#484848", marginTop:3 }}>
                    {activePos.length} active stake{activePos.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <button
                onClick={() => { void refreshPositions(); void refreshBalance(); }}
                disabled={loadingPos}
                style={{ background:"none", border:"1px solid #1e1e1e", borderRadius:8, color:"#555", cursor:"pointer", padding:"6px 11px", fontSize:13, transition:"all .2s", display:"flex", alignItems:"center", gap:5 }}
                onMouseEnter={e => { e.currentTarget.style.color="#22c55e"; e.currentTarget.style.borderColor="#22c55e33"; }}
                onMouseLeave={e => { e.currentTarget.style.color="#555"; e.currentTarget.style.borderColor="#1e1e1e"; }}
                title="Refresh positions"
              >
                <span className={loadingPos ? "spinner" : ""}>↻</span>
                <span style={{ fontSize:12 }}>Refresh</span>
              </button>
            </div>

            {/* Loading state */}
            {loadingPos ? (
              <div className="loading-overlay">
                <div className="loading-ring"/>
                <p style={{ fontSize:13 }}>{loadingMsg || "Loading…"}</p>
              </div>
            ) : activePos.length === 0 ? (
              /* Empty state */
              <div style={{ textAlign:"center", padding:"48px 20px", border:"1px dashed #1c1c1c", borderRadius:14 }}>
                <div style={{ fontSize:36, marginBottom:12 }}>📭</div>
                <p style={{ fontSize:14, fontWeight:600, color:"#444" }}>No active positions</p>
                <p style={{ fontSize:12, marginTop:6, color:"#333" }}>
                  Stake ETH on the left to mint your first position.
                </p>
              </div>
            ) : (
              /* Position cards */
              <div className="pos-grid">
                {activePos.map(pos => {
                  const unlocked   = isUnlocked(pos);
                  const isClaiming = pending === `claim-${pos.tokenId}`;
                  const isUnstaking= pending === `unstake-${pos.tokenId}`;
                  const anyPending = Boolean(pending);

                  return (
                    <div key={String(pos.tokenId)} className="pos-card fade-up">

                      {/* Top row: token ID + lock badge */}
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ background:"#22c55e18", borderRadius:6, padding:"4px 8px" }}>
                            <span className="mono" style={{ fontSize:11, color:"#4ade80", fontWeight:600 }}>
                              NFT #{String(pos.tokenId)}
                            </span>
                          </div>
                        </div>
                        <span className={unlocked ? "pill-green" : "pill-orange"}>
                          {unlocked ? "✓ Unlocked" : timeLeft(pos)}
                        </span>
                      </div>

                      {/* Amount + reward boxes */}
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                        <div style={{ background:"#111", border:"1px solid #1a1a1a", borderRadius:10, padding:"10px 12px" }}>
                          <p style={{ fontSize:10, color:"#444", textTransform:"uppercase", letterSpacing:".1em", marginBottom:5 }}>Staked</p>
                          <p className="mono" style={{ fontSize:15, fontWeight:600, color:"#ddd" }}>
                            {formatEth(pos.amount)} <span style={{ fontSize:11, color:"#555" }}>ETH</span>
                          </p>
                        </div>
                        <div style={{ background:"#111", border:"1px solid #22c55e18", borderRadius:10, padding:"10px 12px" }}>
                          <p style={{ fontSize:10, color:"#444", textTransform:"uppercase", letterSpacing:".1em", marginBottom:5 }}>Reward</p>
                          <p className="mono" style={{ fontSize:15, fontWeight:600, color:"#22c55e" }}>
                            {formatEth(pos.reward, 8)} <span style={{ fontSize:11, color:"#166534" }}>ETH</span>
                          </p>
                        </div>
                      </div>

                      {/* Staked since */}
                      <p style={{ fontSize:11, color:"#333" }}>
                        Staked since {formatDate(pos.startTime)}
                      </p>

                      {/* Action buttons */}
                      <div style={{ display:"flex", gap:8 }}>
                        <button
                          className="btn-ghost"
                          onClick={() => handleClaim(pos)}
                          disabled={anyPending || pos.reward === 0n}
                          title={pos.reward === 0n ? "No reward accrued yet" : "Claim accumulated reward"}
                        >
                          {isClaiming ? <><span className="spinner">↻</span> Claiming…</> : "Claim Reward"}
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleUnstake(pos)}
                          disabled={anyPending || !unlocked}
                          title={!unlocked ? `Locked: ${timeLeft(pos)}` : "Unstake and receive ETH + rewards"}
                        >
                          {isUnstaking ? <><span className="spinner">↻</span> Unstaking…</> : "Unstake"}
                        </button>
                      </div>

                      {/* Lock warning */}
                      {!unlocked && (
                        <p style={{ fontSize:11, color:"#2a2a2a", textAlign:"center", marginTop:-4 }}>
                          🔒 Unstake unlocks in {timeLeft(pos)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Contract link */}
        <p style={{ marginTop:32, textAlign:"center", fontSize:11, color:"#222" }}>
          Contract{" "}
          <a href={`https://sepolia.etherscan.io/address/${STAKING_ADDRESS}`} target="_blank" rel="noopener noreferrer"
            className="mono" style={{ color:"#22c55e28", textDecoration:"none" }}>
            {STAKING_ADDRESS}
          </a>
        </p>
      </div>
    </>
  );
}