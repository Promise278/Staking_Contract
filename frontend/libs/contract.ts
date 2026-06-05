export const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";

export const ABI = [
  "function stake() payable",
  "function calculateReward(uint256 tokenId) view returns (uint256)",
  "function claimReward(uint256 tokenId)",
  "function unstake(uint256 tokenId)"
] as const;