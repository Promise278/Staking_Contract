const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staking", function () {

  let staking;
  let owner;

  beforeEach(async function () {

    [owner] = await ethers.getSigners();

    const Staking = await ethers.getContractFactory("Staking");

    staking = await Staking.deploy();
  });

  it("Should create a stake", async function () {

    await staking.stake(100);

    const userStake =
      await staking.getStakebyAddress(owner.address);

    expect(userStake.amount).to.equal(100);
    expect(userStake.active).to.equal(true);
  });

  it("Should increase total staked", async function () {

    await staking.stake(200);

    expect(
      await staking.totalStaked()
    ).to.equal(200);
  });

  it("Should unstake", async function () {

    await staking.stake(100);

    await staking.unstake();

    const userStake =
      await staking.getStakebyAddress(owner.address);

    expect(userStake.active).to.equal(false);
    expect(userStake.amount).to.equal(0);
  });

  it("Should get all stakes", async function () {

    await staking.stake(100);

    const stakes =
      await staking.getAllStakes();

    expect(stakes.length).to.equal(1);
  });

  it("Should get stake by index", async function () {

    await staking.stake(500);

    const stake =
      await staking.getStakebyIndex(0);

    expect(stake.amount).to.equal(500);
  });

});