export const CONTRACT_ADDRESS = "0xFcA9f84E9B95F7E7Fc9f31326108e4e6A4F62dA2";
export const REWARD_ADDRESS = "0xfAb84c04c46BE65c3990Ba70a09022Bf618a6971";

export const SEPOLIA_CHAIN_ID = "0xaa36a7";

export const ABI = [
  "function stake() payable",
  "function calculateReward(uint256 tokenId) view returns (uint256)",
  "function claimReward(uint256 tokenId)",
  "function unstake(uint256 tokenId)"
];