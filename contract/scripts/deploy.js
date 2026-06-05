const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  const StakeNFT = await ethers.getContractFactory("StakeNFT");
  const nft = await StakeNFT.deploy();

  await nft.waitForDeployment();

  console.log("StakeNFT:", await nft.getAddress());

  const ETHStaking = await ethers.getContractFactory(
    "ETHStaking"
  );

  const staking = await ETHStaking.deploy(
    await nft.getAddress()
  );

  await staking.waitForDeployment();

  console.log(
    "ETHStaking:",
    await staking.getAddress()
  );

  await nft.setStakingContract(
    await staking.getAddress()
  );

  console.log(
    "NFT connected to staking contract"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});