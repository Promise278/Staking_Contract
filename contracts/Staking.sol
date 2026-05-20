// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Staking {
  struct Stake {
    uint256 amount;
    uint256 stakedAt;
    bool active;
    address creator;
  }

  Stake[] public allstakes;

  mapping(address => Stake) public stakes;

  uint256 public totalStaked;

  function stake(uint256 amount) external {
    require(amount > 0, "Invalid amount");

    Stake memory newStake = Stake({
      amount: amount,
      stakedAt: block.timestamp,
      active: true,
      creator: msg.sender
    });

    stakes[msg.sender] = newStake;

    allstakes.push(newStake);

    totalStaked += amount;
  }

  function unstake() external {
    Stake storage userStake = stakes[msg.sender];
    require( userStake.active, "No active stake");
    totalStaked -= userStake.amount;
    userStake.active = false;
    userStake.amount = 0;
  }

  function getStakebyAddress(address user) external view returns (Stake memory) {
    return stakes[user];
  }

  function getStakebyIndex(uint256 _index) external view returns (Stake memory) {
    require( _index < allstakes.length, "Stake does not exist");
    return allstakes[_index];
  }

  function getAllStakes() external view returns (Stake[] memory) {
    return allstakes;
  }
}