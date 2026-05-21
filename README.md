# Staking Contract

A simple staking contract built with Solidity and Hardhat.

## What it does
- Stake tokens
- Unstake tokens
- View your stake or anyone else's

## Functions

- `stake(amount)` — lock your tokens
- `unstake()` — get your tokens back
- `getStakeByAddress(address)` — see stake by wallet
- `getStakeByIndex(index)` — see stake by position
- `getAllStakes()` — see all stakes ever made
- `totalStaked` — total tokens staked right now

## How to run

```bash
npm install
npx hardhat compile
npx hardhat test
```

## Inheritance used

`Erc20Reward` now inherits from `Erc20Token`.
That means the reward token reuses the base token logic instead of redefining its own balances, supply, transfer, and mint flow.

## How to deploy

1. Create a `.env` file in `staking_contract` with:

```bash
SEPOLIA_URL=your_rpc_url
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

2. Compile:

```bash
npx hardhat compile
```

3. Deploy to local Hardhat network:

```bash
npx hardhat ignition deploy ./ignition/modules/Staking.js
```

4. Deploy to Sepolia:

```bash
npx hardhat ignition deploy ./ignition/modules/Staking.js --network sepolia
```

5. Verify after deployment:

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

Developed by PromotexDev
