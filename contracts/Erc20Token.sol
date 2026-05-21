// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Erc20Token {
    string public _name;
    string public _symbol;
    uint8 public _decimals;

    address public owner;
    uint256 private _totalSupply;

    mapping(address => uint256) private _balance;
    mapping(address => mapping(address => uint256)) private _allowed;

    constructor(string memory tokenName, string memory tokenSymbol, uint256 initialSupply) {
        _name = tokenName;
        _symbol = tokenSymbol;
        _decimals = 18;
        owner = msg.sender;

        _mint(msg.sender, initialSupply * 10 ** _decimals);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can mint");
        _;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balance[account];
    }

    function transfer(address to, uint256 value) public returns (bool success) {
        require(_balance[msg.sender] >= value, "Insufficient balance");
        _balance[msg.sender] -= value;
        _balance[to] += value;
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool success) {
        require(_allowed[from][msg.sender] >= value, "Allowance exceeded");
        require(_balance[from] >= value, "Insufficient balance");

        _allowed[from][msg.sender] -= value;
        _balance[from] -= value;
        _balance[to] += value;
        return true;
    }

    function approve(address spender, uint256 value) public returns (bool success) {
        _allowed[msg.sender][spender] = value;
        return true;
    }

    function allowance(address tokenOwner, address spender) public view returns (uint256 remaining) {
        return _allowed[tokenOwner][spender];
    }

    function mint(address to, uint256 amount) public virtual onlyOwner {
        _mint(to, amount);
    }

    function _mint(address to, uint256 amount) internal {
        _totalSupply += amount;
        _balance[to] += amount;
    }
}
