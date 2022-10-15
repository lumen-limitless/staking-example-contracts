// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract SteakToken is ERC20, ERC20Permit {
    address public owner;

    mapping(address => uint) public lastFaucetMint;

    constructor(uint256 initialSupply)
        ERC20("Steak Token", "STEAK")
        ERC20Permit("Steak Token")
    {
        owner = msg.sender;
        _mint(msg.sender, initialSupply);
    }

    modifier onlyOwner() {
        require(_msgSender() == owner);
        _;
    }

    modifier onlyOncePerDay() {
        require(block.timestamp - lastFaucetMint[_msgSender()] > 1 days);
        _;
    }

    function mint(uint256 amount, address to) public onlyOwner {
        _mint(to, amount);
    }

    function faucetMint() public onlyOncePerDay {
        lastFaucetMint[msg.sender] = block.timestamp;
        _mint(msg.sender, 100e18);
    }
}
