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

---
Developed by PromotexDev