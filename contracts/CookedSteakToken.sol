// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CookedSteakToken is ERC20 {
    address public owner;
    address public minter;

    constructor() ERC20("Cooked Steak Token", "cSTEAK") {
        owner = _msgSender();
    }

    modifier onlyOwner() {
        require(_msgSender() == owner);
        _;
    }

    modifier onlyMinter() {
        require(_msgSender() == minter);
        _;
    }

    function mint(uint256 amount, address to) external onlyMinter {
        _mint(to, amount);
    }

    function setMinter(address newMinter) external onlyOwner {
        minter = newMinter;
    }
}
