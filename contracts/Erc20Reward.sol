// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;
contract Erc20Reward {
    string  public name     = "C4 Rewards";
    string  public symbol   = "C4R";
    uint8   public decimals = 18;
    address public owner;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;

    constructor() {
        owner = msg.sender;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == owner, "Not owner");
        totalSupply    += amount;
        balanceOf[to]  += amount;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to]         += amount;
        return true;
    }
}