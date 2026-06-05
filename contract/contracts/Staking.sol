// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./StakeNFT.sol";

contract ETHStaking is Ownable, ReentrancyGuard {

    StakeNFT public nft;

    uint256 public constant APR = 10; // 10%
    uint256 public constant LOCK_PERIOD = 7 days;

    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        bool withdrawn;
    }

    mapping(uint256 => StakeInfo) public stakes;

    event Staked(
        address indexed user,
        uint256 indexed tokenId,
        uint256 amount
    );

    event Claimed(
        address indexed user,
        uint256 indexed tokenId,
        uint256 reward
    );

    event Unstaked(
        address indexed user,
        uint256 indexed tokenId,
        uint256 amount,
        uint256 reward
    );

    constructor(address nftAddress) Ownable(msg.sender){
        nft = StakeNFT(nftAddress);
    }

    receive() external payable {}

    function stake() external payable nonReentrant{
        require(msg.value > 0, "Zero amount");

        uint256 tokenId = nft.mint(msg.sender);

        stakes[tokenId] = StakeInfo({
            amount: msg.value,
            startTime: block.timestamp,
            withdrawn: false
        });

        emit Staked(
            msg.sender,
            tokenId,
            msg.value
        );
    }

    function calculateReward( uint256 tokenId ) public view returns(uint256){
        StakeInfo memory s = stakes[tokenId];

        uint256 duration = block.timestamp - s.startTime;

        return (s.amount * APR * duration) / (365 days * 100);
    }

    function claimReward(uint256 tokenId) external nonReentrant {
        require(
            nft.ownerOf(tokenId) ==
            msg.sender,
            "Not owner"
        );

        uint256 reward = calculateReward(tokenId);

        require(reward > 0);

        stakes[tokenId].startTime = block.timestamp;

        payable(msg.sender)
            .transfer(reward);

        emit Claimed(
            msg.sender,
            tokenId,
            reward
        );
    }

    function unstake(uint256 tokenId) external nonReentrant{
        require( nft.ownerOf(tokenId) == msg.sender, "Not owner");

        StakeInfo storage s = stakes[tokenId];

        require( !s.withdrawn, "Already withdrawn");

        uint256 reward = calculateReward(tokenId);

        uint256 payout = s.amount + reward;

        s.withdrawn = true;

        nft.burn(tokenId);

        payable(msg.sender).transfer(payout);

        emit Unstaked(
            msg.sender,
            tokenId,
            s.amount,
            reward
        );
    }

    function fundRewards()
        external
        payable
        onlyOwner
    {}
}