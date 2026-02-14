// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentSkillRegistry
 * @dev Registry for OpenClaw Agent Skills.
 *      Allows the admin to register new skills (modules).
 *      Allows agent owners to "equip" skills to their agents.
 */
contract AgentSkillRegistry is Ownable {
    
    struct Skill {
        string name;
        string description;
        string ipfsHash; // Link to code/config
        uint256 price;   // In native token (BNB), 0 for now
        bool isActive;
    }

    // Skill ID => Skill Data
    mapping(uint256 => Skill) public skills;
    uint256 public skillCount;

    // Agent ID => List of Equipped Skill IDs
    mapping(uint256 => uint256[]) public agentSkills;

    // Agent Registry (Launchpad) Address to verify ownership
    address public launchpadAddress;

    event SkillRegistered(uint256 indexed skillId, string name, uint256 price);
    event SkillEquipped(uint256 indexed agentId, uint256 indexed skillId);

    constructor(address _launchpadAddress) Ownable(msg.sender) {
        launchpadAddress = _launchpadAddress;
    }

    function registerSkill(string memory _name, string memory _description, string memory _ipfsHash, uint256 _price) external onlyOwner {
        skillCount++;
        skills[skillCount] = Skill(_name, _description, _ipfsHash, _price, true);
        emit SkillRegistered(skillCount, _name, _price);
    }

    // Verify ownership via Launchpad (Mock interaction for now, assumes msg.sender is owner)
    // In production, we'd call ForgeLaunchpad(launchpadAddress).ownerOf(agentId)
    function equipSkill(uint256 _agentId, uint256 _skillId) external {
        require(skills[_skillId].isActive, "Skill not active");
        
        // TODO: Check ownership of agentId
        // require(ForgeLaunchpad(launchpadAddress).ownerOf(_agentId) == msg.sender, "Not agent owner");

        // Check if already equipped
        uint256[] memory currentSkills = agentSkills[_agentId];
        for (uint256 i = 0; i < currentSkills.length; i++) {
            require(currentSkills[i] != _skillId, "Skill already equipped");
        }

        agentSkills[_agentId].push(_skillId);
        emit SkillEquipped(_agentId, _skillId);
    }

    function getAgentSkills(uint256 _agentId) external view returns (Skill[] memory) {
        uint256[] memory skillIds = agentSkills[_agentId];
        Skill[] memory result = new Skill[](skillIds.length);
        
        for (uint256 i = 0; i < skillIds.length; i++) {
            result[i] = skills[skillIds[i]];
        }
        return result;
    }
}
