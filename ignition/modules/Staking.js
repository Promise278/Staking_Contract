const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("StakingModule", (m) => {
  const stakingTokenName = m.getParameter("stakingTokenName", "Class Staking Token");
  const stakingTokenSymbol = m.getParameter("stakingTokenSymbol", "CST");
  const stakingInitialSupply = m.getParameter("stakingInitialSupply", 1000000);
  const annualRewardRateBps = m.getParameter("annualRewardRateBps", 1200);
  const minimumStakingPeriod = m.getParameter("minimumStakingPeriod", 604800);

  const stakingToken = m.contract("Erc20Token", [
    stakingTokenName,
    stakingTokenSymbol,
    stakingInitialSupply,
  ]);

  const rewardToken = m.contract("Erc20Reward", []);
  const staking = m.contract("Staking", [
    stakingToken,
    rewardToken,
    annualRewardRateBps,
    minimumStakingPeriod,
  ]);
  m.call(rewardToken, "transferOwnership", [staking]);

  return { stakingToken, rewardToken, staking };
});
