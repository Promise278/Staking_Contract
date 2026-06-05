# Staking Contract

A simple staking contract built with Solidity and Hardhat.

## What it does
- Stake tokens
- Calculate rewards over time
- Enforce a minimum staking period
- Unstake and get back your principal plus reward
- View your stake or anyone else's

## Functions

- `stake(amount)` — lock your tokens
- `unstake()` — end a stake after the minimum period and receive principal plus reward
- `calculateReward(address)` — see rewards earned so far
- `canUnstake(address)` — check if the lock period has ended
- `getStakeByAddress(address)` — see stake by wallet
- `getStakeByIndex(index)` — see stake by position
- `getAllStakes()` — see all stakes ever made
- `totalStaked` — total tokens staked right now
- `annualRewardRateBps` — reward rate in basis points
- `minimumStakingPeriod` — minimum lock time in seconds

## How to run

```bash
npm install
npx hardhat compile
npx hardhat test
```

## Inheritance used

`Erc20Reward` now inherits from `Erc20Token`.
That means the reward token reuses the base token logic instead of redefining its own balances, supply, transfer, and mint flow.

## Reward formula

```text
reward = (stakedAmount * annualRewardRateBps * stakingDurationInSeconds)
         / (10000 * 365 days)
```

This means reward grows linearly with:

- bigger staked amount
- longer staking time
- higher annual reward rate

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

Default deployment values:

- `annualRewardRateBps = 1200` which is `12%` yearly reward
- `minimumStakingPeriod = 604800` which is `7 days`

5. Verify after deployment:

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```
