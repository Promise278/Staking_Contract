"use client";

import { useState, useEffect, useCallback, useMemo, type FormEvent } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useBalance,
  usePublicClient,
  useWalletClient,
  useSwitchChain,
} from "wagmi";
import { sepolia } from "wagmi/chains";
import {
  parseEther,
  formatEther,
  parseAbi,
  getAddress,
  type PublicClient,
  type WalletClient,
} from "viem";

// ─── Config ────────────────────────────────────────────────────────────────────
const STAKING_ADDRESS = "0xFcA9f84E9B95F7E7Fc9f31326108e4e6A4F62dA2" as const;

// ─── ABIs ─────────────────────────────────────────────────────────────────────
const STAKING_ABI = parseAbi([
  "function stake() external payable",
  "function unstake(uint256 tokenId) external",
  "function claimReward(uint256 tokenId) external",
  "function calculateReward(uint256 tokenId) public view returns (uint256)",
  "function stakes(uint256 tokenId) public view returns (uint256 amount, uint256 startTime, bool withdrawn)",
  "function nft() public view returns (address)",
  "event Staked(address indexed user, uint256 indexed tokenId, uint256 amount)",
  "event Unstaked(address indexed user, uint256 indexed tokenId, uint256 amount, uint256 reward)",
  "event Claimed(address indexed user, uint256 indexed tokenId, uint256 reward)",
]);

const NFT_ABI = parseAbi([
  "function ownerOf(uint256 tokenId) public view returns (address)",
]);

// ─── Types ────────────────────────────────────────────────────────────────────
type StakePosition = {
  tokenId: bigint;
  amount: bigint;
  startTime: bigint;
  withdrawn: boolean;
  reward: bigint;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtEth(wei: bigint, dp = 4): string {
  const n = Number(formatEther(wei));
  return n.toFixed(n < 0.0001 ? 8 : dp);
}

function fmtDate(ts: bigint): string {
  if (!ts) return "—";
  return new Date(Number(ts) * 1000).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function getErrMsg(e: unknown): string {
  if (typeof e === "object" && e !== null) {
    const err = e as Record<string, unknown>;
    if (typeof err.reason === "string") return err.reason;
    if (typeof err.shortMessage === "string") return err.shortMessage;
    if (typeof err.message === "string") {
      const m = err.message as string;
      const match = m.match(/reason="([^"]+)"/);
      if (match) return match[1];
      if (m.includes("user rejected") || m.includes("User denied"))
        return "Transaction rejected.";
      return m.slice(0, 160);
    }
  }
  return "Something went wrong.";
}

const LOCK_SECS = 7 * 24 * 60 * 60;

function isUnlocked(pos: StakePosition): boolean {
  return Math.floor(Date.now() / 1000) - Number(pos.startTime) >= LOCK_SECS;
}

function timeLeft(pos: StakePosition): string {
  const rem = LOCK_SECS - (Math.floor(Date.now() / 1000) - Number(pos.startTime));
  if (rem <= 0) return "Unlocked";
  const d = Math.floor(rem / 86400);
  const h = Math.floor((rem % 86400) / 3600);
  const m = Math.floor((rem % 3600) / 60);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

// ─── Read positions (pure viem publicClient) ──────────────────────────────────
async function loadPositions(client: PublicClient, userAddress: string): Promise<StakePosition[]> {
  const user = getAddress(userAddress);

  const nftAddr = await client.readContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "nft",
  });

  const stakedLogs = await client.getContractEvents({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    eventName: "Staked",
    args: { user },
    fromBlock: 0n,
    toBlock: "latest",
  });

  if (stakedLogs.length === 0) return [];

  const tokenIds = [...new Set(stakedLogs.map((l) => l.args.tokenId!))];

  const results = await Promise.allSettled(
    tokenIds.map(async (tokenId): Promise<StakePosition | null> => {
      // Check ownership — reverts if NFT burned
      try {
        const owner = await client.readContract({
          address: nftAddr,
          abi: NFT_ABI,
          functionName: "ownerOf",
          args: [tokenId],
        });
        if (getAddress(owner as string) !== user) return null;
      } catch {
        return null;
      }

      // stakes() returns a tuple — destructure by index
      const raw = await client.readContract({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "stakes",
        args: [tokenId],
      }) as [bigint, bigint, boolean];

      const [amount, startTime, withdrawn] = raw;
      if (withdrawn) return null;

      let reward = 0n;
      try {
        reward = await client.readContract({
          address: STAKING_ADDRESS,
          abi: STAKING_ABI,
          functionName: "calculateReward",
          args: [tokenId],
        }) as bigint;
      } catch { /* stays 0 */ }

      return { tokenId, amount, startTime, withdrawn, reward };
    })
  );

  const active = results
    .filter((r): r is PromiseFulfilledResult<StakePosition | null> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((p): p is StakePosition => p !== null);

  active.sort((a, b) => Number(b.startTime - a.startTime));
  return active;
}

// ─── Write helpers (pure viem walletClient) ───────────────────────────────────
async function txStake(wallet: WalletClient, pub: PublicClient, amount: string) {
  const [account] = await wallet.getAddresses();
  const hash = await wallet.writeContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "stake",
    value: parseEther(amount),
    account,
    chain: sepolia,
  });
  return pub.waitForTransactionReceipt({ hash });
}

async function txClaim(wallet: WalletClient, pub: PublicClient, tokenId: bigint) {
  const [account] = await wallet.getAddresses();
  const hash = await wallet.writeContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "claimReward",
    args: [tokenId],
    account,
    chain: sepolia,
  });
  return pub.waitForTransactionReceipt({ hash });
}

async function txUnstake(wallet: WalletClient, pub: PublicClient, tokenId: bigint) {
  const [account] = await wallet.getAddresses();
  const hash = await wallet.writeContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "unstake",
    args: [tokenId],
    account,
    chain: sepolia,
  });
  return pub.waitForTransactionReceipt({ hash });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Home() {
  const { address, isConnected, chain } = useAccount();
  const { data: balanceData }           = useBalance({ address });
  const publicClient                    = usePublicClient();
  const { data: walletClient }          = useWalletClient();
  const { switchChain }                 = useSwitchChain();

  const isSepolia = chain?.id === sepolia.id;

  const [positions,  setPositions]  = useState<StakePosition[]>([]);
  const [stakeAmt,   setStakeAmt]   = useState("");
  const [pending,    setPending]    = useState("");
  const [notice,     setNotice]     = useState("");
  const [error,      setError]      = useState("");
  const [loadingPos, setLoadingPos] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");

  const walletBal    = balanceData?.value ?? 0n;
  const activePos    = useMemo(() => positions.filter((p) => !p.withdrawn), [positions]);
  const totalStaked  = useMemo(() => activePos.reduce((s, p) => s + p.amount, 0n), [activePos]);
  const totalRewards = useMemo(() => activePos.reduce((s, p) => s + p.reward, 0n), [activePos]);

  // ── Refresh positions ─────────────────────────────────────────────────────
  const refreshPositions = useCallback(async () => {
    if (!address || !isSepolia || !publicClient) return;
    setLoadingPos(true);
    setLoadingMsg("Fetching your staking positions…");
    setError("");
    try {
      const list = await loadPositions(publicClient as PublicClient, address);
      setPositions(list);
      setLoadingMsg(list.length ? `Loaded ${list.length} position(s).` : "No active positions.");
    } catch (e) {
      setError("Failed to load positions: " + getErrMsg(e));
    } finally {
      setLoadingPos(false);
      setTimeout(() => setLoadingMsg(""), 2500);
    }
  }, [address, isSepolia, publicClient]);

  // ── Stake ─────────────────────────────────────────────────────────────────
  const handleStake = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(stakeAmt);
    if (!stakeAmt || isNaN(parsed) || parsed <= 0) { setError("Enter a valid ETH amount."); return; }
    if (!walletClient || !publicClient) { setError("Wallet not connected."); return; }
    setPending("Staking"); setError(""); setNotice("");
    try {
      setNotice("Confirm the transaction in your wallet…");
      await txStake(walletClient as WalletClient, publicClient as PublicClient, stakeAmt);
      setStakeAmt("");
      setNotice("✓ Staked successfully! Your NFT position is now live.");
      await refreshPositions();
    } catch (e) { setError(getErrMsg(e)); setNotice(""); }
    finally { setPending(""); }
  };

  // ── Claim ─────────────────────────────────────────────────────────────────
  const handleClaim = async (pos: StakePosition) => {
    if (!walletClient || !publicClient) { setError("Wallet not connected."); return; }
    setPending(`claim-${pos.tokenId}`); setError(""); setNotice("");
    try {
      setNotice("Confirm claim in your wallet…");
      await txClaim(walletClient as WalletClient, publicClient as PublicClient, pos.tokenId);
      setNotice(`✓ Reward claimed for position #${pos.tokenId}!`);
      await refreshPositions();
    } catch (e) { setError(getErrMsg(e)); setNotice(""); }
    finally { setPending(""); }
  };

  // ── Unstake ───────────────────────────────────────────────────────────────
  const handleUnstake = async (pos: StakePosition) => {
    if (!walletClient || !publicClient) { setError("Wallet not connected."); return; }
    setPending(`unstake-${pos.tokenId}`); setError(""); setNotice("");
    try {
      setNotice("Confirm unstake in your wallet…");
      await txUnstake(walletClient as WalletClient, publicClient as PublicClient, pos.tokenId);
      setNotice(`✓ Unstaked #${pos.tokenId} — ETH + reward returned to your wallet.`);
      await refreshPositions();
    } catch (e) { setError(getErrMsg(e)); setNotice(""); }
    finally { setPending(""); }
  };

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isConnected && isSepolia) void refreshPositions();
    if (!isConnected) { setPositions([]); setNotice(""); setError(""); }
  }, [isConnected, isSepolia, refreshPositions]);

  // ─── CSS ──────────────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', system-ui, sans-serif; background: #080808; color: #fff; -webkit-font-smoothing: antialiased; }
    .card { background: #111; border: 1px solid #1e1e1e; border-radius: 20px; padding: 24px; }
    .btn-primary { background: #22c55e; color: #000; border: none; border-radius: 10px; padding: 13px 0; width: 100%; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; letter-spacing: .03em; transition: background .15s, transform .1s, opacity .15s; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .btn-primary:hover:not(:disabled) { background: #16a34a; transform: translateY(-1px); }
    .btn-primary:disabled { opacity: .4; cursor: not-allowed; }
    .btn-ghost { background: transparent; color: #22c55e; border: 1px solid #22c55e33; border-radius: 8px; padding: 9px 0; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: background .15s; flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px; }
    .btn-ghost:hover:not(:disabled) { background: #22c55e12; }
    .btn-ghost:disabled { opacity: .35; cursor: not-allowed; }
    .btn-danger { background: transparent; color: #f87171; border: 1px solid #f8717130; border-radius: 8px; padding: 9px 0; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: background .15s; flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px; }
    .btn-danger:hover:not(:disabled) { background: #f8717112; }
    .btn-danger:disabled { opacity: .35; cursor: not-allowed; }
    .input { background: #0d0d0d; border: 1px solid #252525; border-radius: 10px; padding: 12px 14px; color: #fff; font-size: 15px; font-family: 'DM Mono', monospace; width: 100%; outline: none; transition: border-color .2s; }
    .input:focus { border-color: #22c55e66; }
    .input::placeholder { color: #333; }
    .input:disabled { opacity: .5; }
    .pill-green { background: #22c55e18; color: #4ade80; border: 1px solid #22c55e28; border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; }
    .pill-orange { background: #fb923c18; color: #fdba74; border: 1px solid #fb923c28; border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; }
    .notice { background: #22c55e0e; border: 1px solid #22c55e28; border-radius: 10px; padding: 12px 15px; color: #4ade80; font-size: 13px; line-height: 1.5; }
    .err    { background: #f871710e; border: 1px solid #f8717128; border-radius: 10px; padding: 12px 15px; color: #fca5a5; font-size: 13px; }
    .warn   { background: #fb923c0e; border: 1px solid #fb923c28; border-radius: 10px; padding: 12px 15px; color: #fdba74; font-size: 13px; }
    .mono { font-family: 'DM Mono', monospace; }
    .label { font-size: 11px; color: #484848; font-weight: 600; text-transform: uppercase; letter-spacing: .12em; margin-bottom: 8px; }
    .pos-card { background: #0d0d0d; border: 1px solid #1c1c1c; border-radius: 14px; padding: 18px; display: flex; flex-direction: column; gap: 14px; transition: border-color .2s; }
    .pos-card:hover { border-color: #2a2a2a; }
    .spinner { display: inline-block; animation: spin 0.9s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    .fade-up { animation: fadeUp .35s ease forwards; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
    @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 500px)  { .stats-grid { grid-template-columns: 1fr 1fr; } }
    .main-grid { display: grid; grid-template-columns: 320px 1fr; gap: 20px; }
    @media (max-width: 780px) { .main-grid { grid-template-columns: 1fr; } }
    .pos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 14px; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #161616; padding: 14px 20px; max-width: 1100px; margin: 0 auto; }
    .dashboard { max-width: 1100px; margin: 0 auto; padding: 28px 20px 60px; }
    .loading-overlay { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 52px 20px; gap: 14px; color: #444; }
    .loading-ring { width: 40px; height: 40px; border: 2px solid #1e1e1e; border-top-color: #22c55e; border-radius: 50%; animation: spin .8s linear infinite; }
  `;

  // ─── LANDING ──────────────────────────────────────────────────────────────
  if (!isConnected) return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
        <div className="fade-up" style={{ width:"100%", maxWidth:"420px", background:"#111", border:"1px solid #1e1e1e", borderRadius:"28px", padding:"44px 36px 40px", textAlign:"center" }}>
          <div style={{ width:68, height:68, borderRadius:"50%", background:"#22c55e0f", border:"1px solid #22c55e22", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px", position:"relative" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <div style={{ position:"absolute", inset:-8, borderRadius:"50%", border:"1px solid #22c55e0e" }}/>
          </div>
          <p style={{ fontSize:10, letterSpacing:".2em", color:"#22c55e", fontWeight:700, textTransform:"uppercase" }}>Sepolia Testnet</p>
          <h1 style={{ fontSize:34, fontWeight:700, letterSpacing:"-.02em", marginTop:10 }}>GreenStake</h1>
          <p style={{ color:"#555", fontSize:14, marginTop:10, lineHeight:1.65 }}>Stake ETH, earn 10% APR rewards, and manage your NFT staking positions.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:24, marginBottom:28 }}>
            {([["⬆","Stake ETH — mint an NFT position"],["🎁","Claim rewards without unstaking"],["⬇","Unstake after 7-day lock period"]] as [string,string][]).map(([icon,label]) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 13px", background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:10 }}>
                <span style={{ fontSize:15 }}>{icon}</span>
                <span style={{ fontSize:13, color:"#666" }}>{label}</span>
              </div>
            ))}
          </div>
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button className="btn-primary" onClick={openConnectModal}>Connect Wallet</button>
            )}
          </ConnectButton.Custom>
        </div>
      </div>
    </>
  );

  // ─── DASHBOARD ────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>

      <div className="header">
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <span style={{ fontWeight:700, fontSize:15 }}>GreenStake</span>
        </div>
        <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
      </div>

      <div className="dashboard">
        {notice && <div className="notice fade-up" style={{ marginBottom:16 }}>{notice}</div>}
        {error  && <div className="err   fade-up" style={{ marginBottom:16 }}>{error}</div>}
        {!isSepolia && (
          <div className="warn" style={{ marginBottom:16 }}>
            ⚠ Wrong network.{" "}
            <button onClick={() => switchChain({ chainId: sepolia.id })} style={{ background:"none", border:"none", color:"#fb923c", textDecoration:"underline", cursor:"pointer", fontFamily:"inherit", fontSize:"inherit" }}>
              Switch to Sepolia
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          {([
            { label:"Wallet Balance",   value:`${fmtEth(walletBal)} ETH`,       green:false },
            { label:"Total Staked",     value:`${fmtEth(totalStaked)} ETH`,     green:true  },
            { label:"Pending Rewards",  value:`${fmtEth(totalRewards,6)} ETH`,  green:true  },
            { label:"Active Positions", value:String(activePos.length),          green:false },
          ] as const).map(({ label, value, green }) => (
            <div key={label} className="card">
              <p className="label">{label}</p>
              <p style={{ fontSize:22, fontWeight:700, color: green ? "#22c55e" : "#fff", marginTop:6 }}>{value}</p>
            </div>
          ))}
        </div>

        <div className="main-grid">

          {/* Stake panel */}
          <div className="card" style={{ alignSelf:"start" }}>
            <h2 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Stake ETH</h2>
            <form onSubmit={handleStake}>
              <p className="label">Amount (ETH)</p>
              <input className="input" type="number" step="0.0001" min="0.0001" placeholder="0.01" value={stakeAmt} onChange={(e) => setStakeAmt(e.target.value)} disabled={!isSepolia || Boolean(pending)} />
              <div style={{ margin:"16px 0", background:"#0c0c0c", borderRadius:10, padding:"14px 16px", display:"flex", flexDirection:"column", gap:9 }}>
                {([["APR","10%"],["Lock Period","7 days"],["Reward","ETH"],["Receipt","NFT minted"]] as const).map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
                    <span style={{ color:"#484848" }}>{k}</span>
                    <span className="mono" style={{ color:"#777" }}>{v}</span>
                  </div>
                ))}
              </div>
              <button className="btn-primary" type="submit" disabled={!isSepolia || Boolean(pending)}>
                {pending === "Staking" ? <><span className="spinner">↻</span> Confirm in wallet…</> : "Stake ETH"}
              </button>
            </form>
          </div>

          {/* Positions panel */}
          <div className="card">
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <div>
                <h2 style={{ fontSize:16, fontWeight:700 }}>Your Positions</h2>
                {activePos.length > 0 && <p style={{ fontSize:12, color:"#484848", marginTop:3 }}>{activePos.length} active stake{activePos.length !== 1 ? "s" : ""}</p>}
              </div>
              <button onClick={() => void refreshPositions()} disabled={loadingPos}
                style={{ background:"none", border:"1px solid #1e1e1e", borderRadius:8, color:"#555", cursor:"pointer", padding:"6px 11px", fontSize:13, display:"flex", alignItems:"center", gap:5 }}
                onMouseEnter={(e) => { e.currentTarget.style.color="#22c55e"; e.currentTarget.style.borderColor="#22c55e33"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color="#555"; e.currentTarget.style.borderColor="#1e1e1e"; }}>
                <span className={loadingPos ? "spinner" : ""}>↻</span>
                <span style={{ fontSize:12 }}>Refresh</span>
              </button>
            </div>

            {loadingPos ? (
              <div className="loading-overlay">
                <div className="loading-ring"/>
                <p style={{ fontSize:13 }}>{loadingMsg || "Loading…"}</p>
              </div>
            ) : activePos.length === 0 ? (
              <div style={{ textAlign:"center", padding:"48px 20px", border:"1px dashed #1c1c1c", borderRadius:14 }}>
                <div style={{ fontSize:36, marginBottom:12 }}>📭</div>
                <p style={{ fontSize:14, fontWeight:600, color:"#444" }}>No active positions</p>
                <p style={{ fontSize:12, marginTop:6, color:"#333" }}>Stake ETH on the left to mint your first position.</p>
              </div>
            ) : (
              <div className="pos-grid">
                {activePos.map((pos) => {
                  const unlocked    = isUnlocked(pos);
                  const isClaiming  = pending === `claim-${pos.tokenId}`;
                  const isUnstaking = pending === `unstake-${pos.tokenId}`;
                  const anyPending  = Boolean(pending);
                  return (
                    <div key={String(pos.tokenId)} className="pos-card fade-up">
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div style={{ background:"#22c55e18", borderRadius:6, padding:"4px 8px" }}>
                          <span className="mono" style={{ fontSize:11, color:"#4ade80", fontWeight:600 }}>NFT #{String(pos.tokenId)}</span>
                        </div>
                        <span className={unlocked ? "pill-green" : "pill-orange"}>{unlocked ? "✓ Unlocked" : timeLeft(pos)}</span>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                        <div style={{ background:"#111", border:"1px solid #1a1a1a", borderRadius:10, padding:"10px 12px" }}>
                          <p style={{ fontSize:10, color:"#444", textTransform:"uppercase", letterSpacing:".1em", marginBottom:5 }}>Staked</p>
                          <p className="mono" style={{ fontSize:15, fontWeight:600, color:"#ddd" }}>{fmtEth(pos.amount)} <span style={{ fontSize:11, color:"#555" }}>ETH</span></p>
                        </div>
                        <div style={{ background:"#111", border:"1px solid #22c55e18", borderRadius:10, padding:"10px 12px" }}>
                          <p style={{ fontSize:10, color:"#444", textTransform:"uppercase", letterSpacing:".1em", marginBottom:5 }}>Reward</p>
                          <p className="mono" style={{ fontSize:15, fontWeight:600, color:"#22c55e" }}>{fmtEth(pos.reward,8)} <span style={{ fontSize:11, color:"#166534" }}>ETH</span></p>
                        </div>
                      </div>
                      <p style={{ fontSize:11, color:"#333" }}>Staked since {fmtDate(pos.startTime)}</p>
                      <div style={{ display:"flex", gap:8 }}>
                        <button className="btn-ghost" onClick={() => handleClaim(pos)} disabled={anyPending || pos.reward === 0n}>
                          {isClaiming ? <><span className="spinner">↻</span> Claiming…</> : "Claim Reward"}
                        </button>
                        <button className="btn-danger" onClick={() => handleUnstake(pos)} disabled={anyPending || !unlocked} title={!unlocked ? `Locked: ${timeLeft(pos)}` : "Unstake"}>
                          {isUnstaking ? <><span className="spinner">↻</span> Unstaking…</> : "Unstake"}
                        </button>
                      </div>
                      {!unlocked && <p style={{ fontSize:11, color:"#2a2a2a", textAlign:"center", marginTop:-4 }}>🔒 Unlocks in {timeLeft(pos)}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <p style={{ marginTop:32, textAlign:"center", fontSize:11, color:"#222" }}>
          Contract{" "}
          <a href={`https://sepolia.etherscan.io/address/${STAKING_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="mono" style={{ color:"#22c55e28", textDecoration:"none" }}>
            {shortAddr(STAKING_ADDRESS)}
          </a>
        </p>
      </div>
    </>
  );
}
