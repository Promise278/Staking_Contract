const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staking", function () {
  let staking;
  let stakingToken;
  let rewardToken;
  let owner;
  let user;
  const annualRewardRateBps = 1200;
  const minimumStakingPeriod = 7 * 24 * 60 * 60;
  const initialSupply = 1_000_000n;
  const transferAmount = 1_000n;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Erc20Token = await ethers.getContractFactory("Erc20Token");
    const Erc20Reward = await ethers.getContractFactory("Erc20Reward");
    const Staking = await ethers.getContractFactory("Staking");

    stakingToken = await Erc20Token.deploy("Class Staking Token", "CST", initialSupply);
    rewardToken = await Erc20Reward.deploy();
    staking = await Staking.deploy(
      await stakingToken.getAddress(),
      await rewardToken.getAddress(),
      annualRewardRateBps,
      minimumStakingPeriod
    );

    await rewardToken.transferOwnership(await staking.getAddress());
    await stakingToken.transfer(user.address, transferAmount);
  });

  async function stakeForUser(amount) {
    await stakingToken.connect(user).approve(await staking.getAddress(), amount);
    await staking.connect(user).stake(amount);
  }

  function expectedReward(amount, duration) {
    return (amount * BigInt(annualRewardRateBps) * BigInt(duration)) / (10_000n * 365n * 24n * 60n * 60n);
  }

  it("Should create a stake", async function () {
    await stakeForUser(100n);

    const userStake =
      await staking.getStakebyAddress(user.address);

    expect(userStake.amount).to.equal(100);
    expect(userStake.active).to.equal(true);
  });

  it("Should increase total staked", async function () {
    await stakeForUser(200n);

    expect(
      await staking.totalStaked()
    ).to.equal(200);
  });

  it("Should calculate reward over time", async function () {
    const amount = 1000n;
    const duration = 30 * 24 * 60 * 60;

    await stakeForUser(amount);

    await ethers.provider.send("evm_increaseTime", [duration]);
    await ethers.provider.send("evm_mine", []);

    const reward = await staking.calculateReward(user.address);

    expect(reward).to.equal(expectedReward(amount, duration));
  });

  it("Should not unstake before minimum period", async function () {
    await stakeForUser(100n);

    await expect(
      staking.connect(user).unstake()
    ).to.be.revertedWith("Minimum staking period not reached");
  });

  it("Should return principal and reward after minimum period", async function () {
    const amount = 100n;

    await stakeForUser(amount);

    const balanceBeforeUnstake = await stakingToken.balanceOf(user.address);

    await ethers.provider.send("evm_increaseTime", [minimumStakingPeriod]);
    await ethers.provider.send("evm_mine", []);

    await staking.connect(user).unstake();

    const userStake =
      await staking.getStakebyAddress(user.address);
    const reward = expectedReward(amount, minimumStakingPeriod);
    const balanceAfterUnstake = await stakingToken.balanceOf(user.address);
    const rewardBalance = await rewardToken.balanceOf(user.address);

    expect(userStake.active).to.equal(false);
    expect(userStake.amount).to.equal(0);
    expect(userStake.rewardEarned).to.equal(reward);
    expect(balanceAfterUnstake - balanceBeforeUnstake).to.equal(amount);
    expect(rewardBalance).to.equal(reward);
  });

  it("Should reduce wallet balance when staking", async function () {
    const amount = 250n;

    const balanceBeforeStake = await stakingToken.balanceOf(user.address);

    await stakeForUser(amount);

    const balanceAfterStake = await stakingToken.balanceOf(user.address);

    expect(balanceBeforeStake - balanceAfterStake).to.equal(amount);
  });

  it("Should get all stakes", async function () {
    await stakeForUser(100n);

    const stakes =
      await staking.getAllStakes();

    expect(stakes.length).to.equal(1);
  });

  it("Should get stake by index", async function () {
    await stakeForUser(500n);

    const stake =
      await staking.getStakebyIndex(0);

    expect(stake.amount).to.equal(500);
  });

  it("Should show whether a user can unstake", async function () {
    await stakeForUser(500n);

    expect(await staking.canUnstake(user.address)).to.equal(false);

    await ethers.provider.send("evm_increaseTime", [minimumStakingPeriod]);
    await ethers.provider.send("evm_mine", []);

    expect(await staking.canUnstake(user.address)).to.equal(true);
  });

});
