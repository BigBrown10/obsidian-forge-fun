import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const TEE_ADDRESS = "0x5df82914551958966f232caa0a1580bb86cf8bd0"; // Deployer as TEE for now
    const ROUTER_ADDRESS = "0x9ac64cc6e4415144c455bd8e4837fea55603e5c3";

    // 1. Deploy InstantLauncher
    const InstantLauncher = await ethers.getContractFactory("InstantLauncher");
    const instantLauncher = await InstantLauncher.deploy(TEE_ADDRESS, ROUTER_ADDRESS);
    await instantLauncher.waitForDeployment();
    const instantAddress = await instantLauncher.getAddress();
    console.log("InstantLauncher deployed to:", instantAddress);

    // 2. Deploy IncubatorVault (formerly ForgeLaunchpad)
    const IncubatorVault = await ethers.getContractFactory("IncubatorVault");
    const incubatorVault = await IncubatorVault.deploy(TEE_ADDRESS, ROUTER_ADDRESS);
    await incubatorVault.waitForDeployment();
    const incubatorAddress = await incubatorVault.getAddress();
    console.log("IncubatorVault deployed to:", incubatorAddress);

    console.log("\n--- DEPLOYMENT COMPLETE ---");
    console.log(`INSTANT_LAUNCHER_ADDRESS="${instantAddress}"`);
    console.log(`INCUBATOR_VAULT_ADDRESS="${incubatorAddress}"`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
