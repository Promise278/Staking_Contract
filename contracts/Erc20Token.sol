// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Erc20Token {

    string public _name;
    string public _symbol;
    uint8 public _decimals = 18;

    address public owner;
    uint256 private _totalSupply;

    mapping(address => uint256) private _balance;
    mapping(address => mapping(address => uint256)) private _allowed;

    constructor (string memory tokenName, string memory tokenSymbol, uint256 initialSupply) {
        _name = tokenName;
        _symbol = tokenSymbol;
        _decimals = 18;
        _totalSupply = initialSupply * 10 ** _decimals;
        _balance[msg.sender] = _totalSupply;
    }

    function name() public view returns (string memory){
        return _name;
    }

    function symbol() public view returns (string memory){
        return _symbol;
    }

    function decimals() public view returns (uint8){
        return _decimals;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return _balance[_owner];
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        _balance[msg.sender] -= _value;
        _balance[_to] += _value;
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        _allowed[_from][msg.sender] -= _value;
        _balance[_from]             -= _value;
        _balance[_to]               += _value;
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        _allowed[msg.sender][_spender] = _value;
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return _allowed[_owner][_spender];
    }

    function mint(address _to, uint256 _amount) public {
        require(msg.sender == owner, "Only owner can mint");
        _totalSupply += _amount;
        _balance[_to] += _amount;
    }   
    
}