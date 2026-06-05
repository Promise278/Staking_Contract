// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakeNFT is ERC721, Ownable {
    uint256 public nextTokenId;
    address public stakingContract;

    constructor() ERC721("Stake Position", "SPOS") Ownable(msg.sender) {}

    modifier onlyStaking() {
        require(msg.sender == stakingContract, "Only staking contract");
        _;
    }

    function setStakingContract(address _staking) external onlyOwner {
        stakingContract = _staking;
    }

    function mint(address to) external onlyStaking returns (uint256) {
        uint256 tokenId = ++nextTokenId;
        _safeMint(to, tokenId);
        return tokenId;
    }

    function burn(uint256 tokenId) external onlyStaking {
        _burn(tokenId);
    }
}