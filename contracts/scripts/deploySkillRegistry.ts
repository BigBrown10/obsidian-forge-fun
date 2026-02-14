import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying AgentSkillRegistry with account:", deployer.address);

    const LAUNCHPAD_ADDRESS = "0xD165568566c2dF451EbDBfd6C5DaA0CE88809e9B";

    console.log("Linking to Launchpad:", LAUNCHPAD_ADDRESS);

    const AgentSkillRegistry = await ethers.getContractFactory("AgentSkillRegistry");
    const registry = await AgentSkillRegistry.deploy(LAUNCHPAD_ADDRESS);

    await registry.waitForDeployment();

    const registryAddress = await registry.getAddress();
    console.log("AgentSkillRegistry deployed to:", registryAddress);

    console.log("\n--- Copy this to your frontend config ---");
    console.log(`NEXT_PUBLIC_SKILL_REGISTRY_ADDRESS=${registryAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
