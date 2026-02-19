import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther } from "ethers";

describe("Hard Decoupling: Split Flow Tests", function () {
    let instantLauncher: any;
    let incubatorVault: any;
    let owner: any;
    let user1: any;
    let user2: any;

    const TARGET_BNB = parseEther("1");

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy Mock Router
        const MockRouter = await ethers.getContractFactory("MockRouter");
        const mockRouter = await MockRouter.deploy();
        await mockRouter.waitForDeployment();
        const routerAddress = await mockRouter.getAddress();

        // 1. Deploy InstantLauncher (Stateless)
        const InstantLauncher = await ethers.getContractFactory("InstantLauncher");
        instantLauncher = await InstantLauncher.deploy(owner.address, routerAddress);
        await instantLauncher.waitForDeployment();

        // 2. Deploy IncubatorVault (Stateful)
        const IncubatorVault = await ethers.getContractFactory("IncubatorVault");
        incubatorVault = await IncubatorVault.deploy(owner.address, routerAddress);
        await incubatorVault.waitForDeployment();
    });

    describe("InstantLauncher", function () {
        it("Should allow instant launch and emit event", async function () {
            const tx = await instantLauncher.connect(user1).launchInstant(
                "InstantAgent",
                "INSTANT",
                "{}",
                { value: parseEther("0.1") }
            );

            await expect(tx).to.emit(instantLauncher, "InstantLaunch");
        });

        it("Should reject if zero liquidity provided", async function () {
            await expect(
                instantLauncher.connect(user1).launchInstant("A", "B", "{}", { value: 0 })
            ).to.be.revertedWith("Must provide initial liquidity");
        });
    });

    describe("IncubatorVault", function () {
        it("Should allow creating incubator proposal", async function () {
            await incubatorVault.connect(user1).createProposal(
                "IncubatorAgent",
                "INCUB",
                "{}",
                TARGET_BNB
            );

            const count = await incubatorVault.proposalCount();
            expect(count).to.equal(1n);

            const proposal = await incubatorVault.proposals(count);
            expect(proposal.name).to.equal("IncubatorAgent");
            expect(proposal.launched).to.be.false;
        });

        it("Should allow pledging to incubator", async function () {
            await incubatorVault.connect(user1).createProposal("A", "B", "{}", TARGET_BNB);

            await incubatorVault.connect(user2).pledge(1n, { value: parseEther("0.5") });

            const proposal = await incubatorVault.proposals(1n);
            expect(proposal.pledgedAmount).to.equal(parseEther("0.5"));
        });

        it("Should launch incubator agent when target reached", async function () {
            await incubatorVault.connect(user1).createProposal("A", "B", "{}", TARGET_BNB);

            await incubatorVault.connect(user2).pledge(1n, { value: TARGET_BNB });

            const proposal = await incubatorVault.proposals(1n);
            expect(proposal.launched).to.be.true;
        });
    });

    describe("Cross-Access Blocking (Logical)", function () {
        it("InstantLauncher should not have state from IncubatorVault", async function () {
            await incubatorVault.connect(user1).createProposal("A", "B", "{}", TARGET_BNB);

            // Try to access proposal via InstantLauncher (impossible, no such function)
            expect(instantLauncher.proposals).to.be.undefined;
        });
    });
});
