// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ForgeToken.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IncubatorVault
 * @dev Stateful vault for agent incubation (pledging/funding).
 *      Strictly decoupled from Instant Launch logic.
 */
contract IncubatorVault is Ownable, ReentrancyGuard {
    struct AgentProposal {
        address creator;
        string name;
        string ticker;
        string metadataURI;
        uint256 targetAmount;
        uint256 pledgedAmount;
        uint256 createdAt;
        bool launched;
        address tokenAddress;
    }

    mapping(uint256 => AgentProposal) public proposals;
    mapping(uint256 => mapping(address => uint256)) public pledges;
    uint256 public proposalCount;
    
    address public teeAddress; 
    IUniswapV2Router02 public uniswapRouter;
    
    uint256 public constant DURATION = 48 hours;
    uint256 public constant PLATFORM_FEE_PERCENT = 5;

    event ProposalCreated(uint256 indexed id, address indexed creator, string name, uint256 target);
    event Pledged(uint256 indexed id, address indexed user, uint256 amount);
    event Launched(uint256 indexed id, address tokenAddress, uint256 raisedAmount);

    constructor(address _teeAddress, address _routerAddress) Ownable(msg.sender) {
        teeAddress = _teeAddress;
        uniswapRouter = IUniswapV2Router02(_routerAddress);
    }

    function createProposal(string memory _name, string memory _ticker, string memory _metadataURI, uint256 _targetAmount) external {
        proposalCount++;
        proposals[proposalCount] = AgentProposal({
            creator: msg.sender,
            name: _name,
            ticker: _ticker,
            metadataURI: _metadataURI,
            targetAmount: _targetAmount,
            pledgedAmount: 0,
            createdAt: block.timestamp,
            launched: false,
            tokenAddress: address(0)
        });

        emit ProposalCreated(proposalCount, msg.sender, _name, _targetAmount);
    }

    function pledge(uint256 _proposalId) external payable nonReentrant {
        AgentProposal storage proposal = proposals[_proposalId];
        require(!proposal.launched, "Already launched");
        require(msg.value > 0, "Must pledge something");

        pledges[_proposalId][msg.sender] += msg.value;
        proposal.pledgedAmount += msg.value;

        emit Pledged(_proposalId, msg.sender, msg.value);

        if (proposal.pledgedAmount >= proposal.targetAmount) {
            _launch(_proposalId);
        }
    }

    function _launch(uint256 _proposalId) internal {
        AgentProposal storage proposal = proposals[_proposalId];
        proposal.launched = true;

        ForgeToken newToken = new ForgeToken(proposal.name, proposal.ticker, address(this));
        proposal.tokenAddress = address(newToken);

        uint256 totalSupply = 1_000_000_000 * 10**18;
        newToken.mint(address(this), totalSupply);

        uint256 platformFee = (proposal.pledgedAmount * PLATFORM_FEE_PERCENT) / 100;
        uint256 liquidityBNB = proposal.pledgedAmount - platformFee;
        
        newToken.approve(address(uniswapRouter), totalSupply);
        
        try uniswapRouter.addLiquidityETH{value: liquidityBNB}(
            address(newToken),
            totalSupply,
            0,
            0,
            address(0xdead),
            block.timestamp + 300
        ) {
            emit Launched(_proposalId, address(newToken), proposal.pledgedAmount);
        } catch {
            newToken.transfer(proposal.creator, totalSupply);
            payable(proposal.creator).transfer(liquidityBNB);
        }

        payable(owner()).transfer(platformFee);
    }
}
