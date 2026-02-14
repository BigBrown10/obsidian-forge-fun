import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

    // Use deployer as the TEE address for now
    const teeAddress = deployer.address;

    // Deploy ForgeLaunchpad
    const ForgeLaunchpad = await ethers.getContractFactory("ForgeLaunchpad");
    const launchpad = await ForgeLaunchpad.deploy(teeAddress);
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
