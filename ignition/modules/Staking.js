const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("StakingModule", (m) => {
  const stakingTokenName = m.getParameter("stakingTokenName", "Class Staking Token");
  const stakingTokenSymbol = m.getParameter("stakingTokenSymbol", "CST");
  const stakingInitialSupply = m.getParameter("stakingInitialSupply", 1000000);

  const stakingToken = m.contract("Erc20Token", [
    stakingTokenName,
    stakingTokenSymbol,
    stakingInitialSupply,
  ]);

  const rewardToken = m.contract("Erc20Reward", []);
  const staking = m.contract("Staking", []);

  return { stakingToken, rewardToken, staking };
});
