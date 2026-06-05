# ETH Staking NFT DApp

A decentralized Ethereum staking application that allows users to stake ETH and receive an NFT as proof of ownership of their stake. The NFT acts as a staking receipt and grants the holder the right to claim rewards or unstake their funds.

## Features

- Stake ETH directly from a wallet
- Receive an NFT representing the stake position
- Earn rewards based on a fixed APR
- Claim rewards without unstaking
- Unstake and receive original deposit plus accumulated rewards
- NFT-based ownership system
- Protection against reentrancy attacks
- Owner-controlled reward funding

---

## Architecture

### ETHStaking Contract

Responsible for:

- Receiving ETH deposits
- Tracking staking information
- Calculating rewards
- Distributing rewards
- Minting staking NFTs
- Returning staked funds

### StakeNFT Contract

Responsible for:

- Minting NFT receipts
- Tracking stake ownership
- Burning NFTs when a stake is withdrawn

---

## Reward Formula

Rewards are calculated using a fixed Annual Percentage Rate (APR).

Reward = (Amount × APR × Duration) / (365 days × 100)

Current APR:

- 10% Annual Percentage Rate

Example:

- Stake: 1 ETH
- Duration: 1 Year

Reward:

- 0.1 ETH

---

## Contract Functions

### stake()

Allows a user to stake ETH.

Requirements:

- ETH amount must be greater than zero.

Example:

```solidity
stake{value: 1 ether}();
```

Result:

- ETH is deposited.
- Stake information is stored.
- NFT receipt is minted.

---

### calculateReward(uint256 tokenId)

Returns the reward earned by a specific staking NFT.

Example:

```solidity
calculateReward(1);
```

Returns:

```text
Current reward in wei
```

---

### claimReward(uint256 tokenId)

Claims accumulated rewards while keeping the stake active.

Requirements:

- Caller must own the staking NFT.

Process:

1. Reward is calculated.
2. Reward is transferred.
3. Reward timer resets.

---

### unstake(uint256 tokenId)

Withdraws the original stake and all pending rewards.

Requirements:

- Caller must own the NFT.
- Stake must not already be withdrawn.

Process:

1. Reward calculated.
2. NFT burned.
3. Stake marked withdrawn.
4. ETH transferred.

---

### fundRewards()

Allows the contract owner to fund reward payouts.

Example:

```solidity
fundRewards{value: 10 ether}();
```

Only the owner can call this function.

---

## Events

### Staked

Emitted whenever a user stakes ETH.

```solidity
event Staked(
    address indexed user,
    uint256 indexed tokenId,
    uint256 amount
);
```

---

### Claimed

Emitted whenever rewards are claimed.

```solidity
event Claimed(
    address indexed user,
    uint256 indexed tokenId,
    uint256 reward
);
```

---

### Unstaked

Emitted whenever a stake is withdrawn.

```solidity
event Unstaked(
    address indexed user,
    uint256 indexed tokenId,
    uint256 amount,
    uint256 reward
);
```

---

## Local Development

### Prerequisites

- Node.js 18+
- npm
- MetaMask
- Hardhat

Install dependencies:

```bash
npm install
```

Compile contracts:

```bash
npx hardhat compile
```

Run tests:

```bash
npx hardhat test
```

Start local blockchain:

```bash
npx hardhat node
```

Deploy contracts:

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

---

## Testing Guide

### Test Staking

1. Connect MetaMask.
2. Call:

```solidity
stake()
```

3. Send:

```text
0.01 ETH
```

Expected:

- NFT minted.
- Stake stored.

---

### Test Reward Calculation

Wait a few minutes.

Call:

```solidity
calculateReward(tokenId)
```

Expected:

- Reward greater than zero.

---

### Test Reward Claim

Call:

```solidity
claimReward(tokenId)
```

Expected:

- Reward transferred.
- Timer reset.

---

### Test Unstake

Call:

```solidity
unstake(tokenId)
```

Expected:

- Original stake returned.
- Reward returned.
- NFT burned.

---

## Frontend Integration

### Install Ethers

```bash
npm install ethers
```

---

### Create Contract Configuration

```ts
export const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";

export const ABI = [
  "function stake() payable",
  "function calculateReward(uint256 tokenId) view returns(uint256)",
  "function claimReward(uint256 tokenId)",
  "function unstake(uint256 tokenId)",
];
```

---

### Connect Wallet

```ts
import { ethers } from "ethers";

const provider = new ethers.BrowserProvider(window.ethereum);

await provider.send("eth_requestAccounts", []);

const signer = await provider.getSigner();
```

---

### Create Contract Instance

```ts
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
```

---

### Stake ETH

```ts
const tx = await contract.stake({
  value: ethers.parseEther("0.01"),
});

await tx.wait();
```

---

### Check Reward

```ts
const reward = await contract.calculateReward(tokenId);
```

---

### Claim Reward

```ts
const tx = await contract.claimReward(tokenId);

await tx.wait();
```

---

### Unstake

```ts
const tx = await contract.unstake(tokenId);

await tx.wait();
```

---

## Security Notes

- Uses OpenZeppelin Ownable.
- Uses ReentrancyGuard to prevent reentrancy attacks.
- Ownership is determined by NFT ownership.
- Ensure reward pool is sufficiently funded before users claim rewards.
- NFT transfers transfer ownership of the staking position.

---

## Future Improvements

- Enforce lock period before unstaking.
- Multiple staking pools.
- Dynamic APR.
- Compounding rewards.
- Dashboard analytics.
- Reward token support.
- Upgradeable contracts.
- Multi-chain deployment.

---

## License

MIT License