// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;
import "./Erc20Token.sol";
contract Erc20Reward is Erc20Token {
    constructor() Erc20Token("C4 Rewards", "C4R", 0) {}

    function mint(address to, uint256 amount) public override onlyOwner {
        _mint(to, amount);
    }
}
