import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

    // Use deployer as the TEE address for now
    const teeAddress = deployer.address;

    // Deploy ForgeLaunchpad
    // PancakeSwap V2 Router (BSC Testnet): 0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3
    const ROUTER_ADDRESS = "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3";
    const ForgeLaunchpad = await ethers.getContractFactory("ForgeLaunchpad");
    const launchpad = await ForgeLaunchpad.deploy(teeAddress, ROUTER_ADDRESS);
    await launchpad.waitForDeployment();

    const launchpadAddress = await launchpad.getAddress();
    console.log("ForgeLaunchpad deployed to:", launchpadAddress);

    console.log("\n--- Copy these to your frontend config ---");
    console.log(`NEXT_PUBLIC_LAUNCHPAD_ADDRESS=${launchpadAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
