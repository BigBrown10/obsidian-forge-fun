// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ForgeToken.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ForgeLaunchpad is Ownable, ReentrancyGuard {
    struct AgentProposal {
        address creator;
        string name;
        string ticker;
        string metadataURI; // Greenfield/IPFS hash
        uint256 targetAmount;
        uint256 pledgedAmount;
        uint256 createdAt;
        bool launched;
        address tokenAddress;
    }

    mapping(uint256 => AgentProposal) public proposals;
    mapping(uint256 => mapping(address => uint256)) public pledges;
    uint256 public proposalCount;
    
    address public teeAddress; // Trusted Execution Environment address
    IUniswapV2Router02 public uniswapRouter;
    
    uint256 public constant DURATION = 48 hours;
    uint256 public constant PLATFORM_FEE_PERCENT = 5; // 5%

    event ProposalCreated(uint256 indexed id, address indexed creator, string name, uint256 target);
    event Pledged(uint256 indexed id, address indexed user, uint256 amount);
    event Refunded(uint256 indexed id, address indexed user, uint256 amount);
    event Launched(uint256 indexed id, address tokenAddress, uint256 raisedAmount);

    // PancakeSwap V2 Router on BSC Testnet: 0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3
    constructor(address _teeAddress, address _routerAddress) Ownable(msg.sender) {
        teeAddress = _teeAddress;
        uniswapRouter = IUniswapV2Router02(_routerAddress);
    }

    function setTEEAddress(address _teeAddress) external onlyOwner {
        teeAddress = _teeAddress;
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
        require(block.timestamp < proposal.createdAt + DURATION, "Proposal expired");
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

        // 1. Deploy Token
        ForgeToken newToken = new ForgeToken(proposal.name, proposal.ticker, address(this));
        proposal.tokenAddress = address(newToken);

        // 2. Mint Initial Supply (e.g. 1 Billion)
        uint256 totalSupply = 1_000_000_000 * 10**18;
        newToken.mint(address(this), totalSupply);

        // 3. Calculate Allocations
        uint256 platformFee = (proposal.pledgedAmount * PLATFORM_FEE_PERCENT) / 100;
        uint256 liquidityBNB = proposal.pledgedAmount - platformFee;
        
        // 4. Add Liquidity
        newToken.approve(address(uniswapRouter), totalSupply);
        
        try uniswapRouter.addLiquidityETH{value: liquidityBNB}(
            address(newToken),
            totalSupply,
            0, // slippage is unavoidable in initial launch
            0, // slippage is unavoidable
            address(0xdead), // Burn LP tokens for fairness
            block.timestamp + 300
        ) {
            emit Launched(_proposalId, address(newToken), proposal.pledgedAmount);
        } catch {
            // Fallback if LP addition fails (shouldn't happen if properly tested)
            // Transfer tokens to creator so they can manually add LP
            newToken.transfer(proposal.creator, totalSupply);
            payable(proposal.creator).transfer(liquidityBNB);
        }

        // 5. Transfer Platform Fee
        payable(owner()).transfer(platformFee);
    }

    function refund(uint256 _proposalId) external nonReentrant {
        AgentProposal storage proposal = proposals[_proposalId];
        require(block.timestamp >= proposal.createdAt + DURATION, "Not expired yet");
        require(!proposal.launched, "Launched successfully");

        uint256 amount = pledges[_proposalId][msg.sender];
        require(amount > 0, "No pledge found");

        pledges[_proposalId][msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit Refunded(_proposalId, msg.sender, amount);
    }
}
