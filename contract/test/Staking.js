const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staking", function () {
  let nft;
  let staking;

  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] =
      await ethers.getSigners();

    const StakeNFT =
      await ethers.getContractFactory(
        "StakeNFT"
      );

    nft = await StakeNFT.deploy();

    await nft.waitForDeployment();

    const ETHStaking =
      await ethers.getContractFactory(
        "ETHStaking"
      );

    staking = await ETHStaking.deploy(
      await nft.getAddress()
    );

    await staking.waitForDeployment();

    await nft.setStakingContract(
      await staking.getAddress()
    );

    await owner.sendTransaction({
      to: await staking.getAddress(),
      value: ethers.parseEther("5"),
    });
  });

  it("should stake ETH", async function () {
    await staking
      .connect(user)
      .stake({
        value: ethers.parseEther("1"),
      });

    expect(
      await nft.ownerOf(1)
    ).to.equal(user.address);

    const stake =
      await staking.stakes(1);

    expect(stake.amount).to.equal(
      ethers.parseEther("1")
    );
  });

  it("should fail with zero ETH", async function () {
    await expect(
      staking.connect(user).stake({
        value: 0,
      })
    ).to.be.revertedWith(
      "Zero amount"
    );
  });

  it("should calculate rewards", async function () {
    await staking
      .connect(user)
      .stake({
        value: ethers.parseEther("1"),
      });

    await ethers.provider.send(
      "evm_increaseTime",
      [30 * 24 * 60 * 60]
    );

    await ethers.provider.send(
      "evm_mine"
    );

    const reward =
      await staking.calculateReward(
        1
      );

    expect(reward).to.be.gt(0);
  });

  it("should claim rewards", async function () {
    await staking
      .connect(user)
      .stake({
        value: ethers.parseEther("1"),
      });

    await ethers.provider.send(
      "evm_increaseTime",
      [30 * 24 * 60 * 60]
    );

    await ethers.provider.send(
      "evm_mine"
    );

    const balanceBefore =
      await ethers.provider.getBalance(
        user.address
      );

    const tx =
      await staking
        .connect(user)
        .claimReward(1);

    const receipt =
      await tx.wait();

    const gas =
      receipt.gasUsed *
      receipt.gasPrice;

    const balanceAfter =
      await ethers.provider.getBalance(
        user.address
      );

    expect(
      balanceAfter
    ).to.be.gt(
      balanceBefore - gas
    );
  });

  it("should unstake and burn NFT", async function () {
    await staking
      .connect(user)
      .stake({
        value: ethers.parseEther("1"),
      });

    await ethers.provider.send(
      "evm_increaseTime",
      [60 * 24 * 60 * 60]
    );

    await ethers.provider.send(
      "evm_mine"
    );

    await staking
      .connect(user)
      .unstake(1);

    await expect(
      nft.ownerOf(1)
    ).to.be.reverted;
  });

  it("should prevent non owner claim", async function () {
    await staking
      .connect(user)
      .stake({
        value: ethers.parseEther("1"),
      });

    await expect(
      staking.claimReward(1)
    ).to.be.revertedWith(
      "Not owner"
    );
  });

  it("should prevent non owner unstake", async function () {
    await staking
      .connect(user)
      .stake({
        value: ethers.parseEther("1"),
      });

    await expect(
      staking.unstake(1)
    ).to.be.revertedWith(
      "Not owner"
    );
  });
});