// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ForgeToken is ERC20, Ownable {
    constructor(string memory name, string memory symbol, address initialOwner) ERC20(name, symbol) Ownable(initialOwner) {
        // Initial minting logic will be handled by the Launchpad or here if pre-minted
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
