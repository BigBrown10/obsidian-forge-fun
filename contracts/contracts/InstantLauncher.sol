// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ForgeToken.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title InstantLauncher
 * @dev Stateless launcher for immediate "Fire and Forget" token launches.
 *      Strictly decoupled from Incubator logic.
 */
contract InstantLauncher is Ownable, ReentrancyGuard {
    address public teeAddress;
    IUniswapV2Router02 public uniswapRouter;
    
    uint256 public constant PLATFORM_FEE_PERCENT = 5; 

    event InstantLaunch(address indexed tokenAddress, address indexed creator, string name, string ticker, string metadataURI, uint256 raisedAmount);

    constructor(address _teeAddress, address _routerAddress) Ownable(msg.sender) {
        teeAddress = _teeAddress;
        uniswapRouter = IUniswapV2Router02(_routerAddress);
    }

    function launchInstant(string memory _name, string memory _ticker, string memory _metadataURI) external payable nonReentrant {
        require(msg.value > 0, "Must provide initial liquidity");

        // 1. Deploy Token
        ForgeToken newToken = new ForgeToken(_name, _ticker, address(this));
        
        // 2. Mint 1 Billion Supply
        uint256 totalSupply = 1_000_000_000 * 10**18;
        newToken.mint(address(this), totalSupply);

        // 3. Calculate Fees
        uint256 platformFee = (msg.value * PLATFORM_FEE_PERCENT) / 100;
        uint256 liquidityBNB = msg.value - platformFee;

        // 4. Add Liquidity
        newToken.approve(address(uniswapRouter), totalSupply);
        
        uniswapRouter.addLiquidityETH{value: liquidityBNB}(
            address(newToken),
            totalSupply,
            0,
            0,
            address(0xdead), 
            block.timestamp + 300
        );

        emit InstantLaunch(address(newToken), msg.sender, _name, _ticker, _metadataURI, msg.value);

        payable(owner()).transfer(platformFee);
    }
}
