import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const TEE_ADDRESS = deployer.address; // For testing, TEE is deployer

    const forgeLaunchpad = await ethers.deployContract("ForgeLaunchpad", [TEE_ADDRESS]);

    await forgeLaunchpad.waitForDeployment();

    console.log("ForgeLaunchpad deployed to:", await forgeLaunchpad.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
