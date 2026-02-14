import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther, formatEther } from "ethers";

describe("Forge Launchpad Flow", function () {
    let launchpad: any;
    let skillRegistry: any;
    let owner: any;
    let user1: any;
    let user2: any;

    const TARGET_BNB = parseEther("10");

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // 1. Deploy Launchpad first (with owner as placeholder TEE)
        const Launchpad = await ethers.getContractFactory("ForgeLaunchpad");
        launchpad = await Launchpad.deploy(owner.address);
        await launchpad.waitForDeployment();

        // 2. Deploy Skill Registry (with Launchpad address)
        const SkillRegistry = await ethers.getContractFactory("AgentSkillRegistry");
        skillRegistry = await SkillRegistry.deploy(await launchpad.getAddress());
        await skillRegistry.waitForDeployment();

        // 3. Update Launchpad with real TEE/Registry address
        await launchpad.setTEEAddress(await skillRegistry.getAddress());
    });

    it("Should allow creating an agent proposal", async function () {
        const tx = await launchpad.connect(user1).createProposal(
            "TestAgent",
            "TEST",
            "{}",
            TARGET_BNB
        );
        await tx.wait();

        const count = await launchpad.proposalCount();
        expect(count).to.equal(1n);

        // Debugging Proposal Data
        const proposal = await launchpad.proposals(1n);
        console.log("Proposal Data:", proposal);

        // Check fields using Array access if proxy (or named props if available)
        // Structure: creator, name, ticker, metadataURI, targetAmount, pledgedAmount, createdAt, launched, tokenAddress
        expect(proposal.name).to.equal("TestAgent");
        expect(proposal.ticker).to.equal("TEST");
        expect(proposal.targetAmount).to.equal(TARGET_BNB); // Contract calls it targetAmount
        expect(proposal.creator).to.equal(user1.address);
        expect(proposal.launched).to.be.false; // Contract calls it launched (not graduated)
    });

    it("Should allow pledging and update bonding curve", async function () {
        await launchpad.connect(user1).createProposal("TestAgent", "TEST", "{}", TARGET_BNB);

        // Pledge 1 BNB
        const pledgeAmount = parseEther("1");
        await launchpad.connect(user2).pledge(1n, { value: pledgeAmount });

        const proposal = await launchpad.proposals(1n);
        // Fix: use pledgedAmount instead of totalRaised
        expect(proposal.pledgedAmount).to.equal(pledgeAmount);
    });

    it("Should graduate when target is reached", async function () {
        await launchpad.connect(user1).createProposal("TestAgent", "TEST", "{}", TARGET_BNB);

        // Pledge full amount (multiple txs)
        await launchpad.connect(user2).pledge(1n, { value: parseEther("5") });
        await launchpad.connect(user1).pledge(1n, { value: parseEther("5") });

        const proposal = await launchpad.proposals(1n);
        expect(proposal.pledgedAmount).to.equal(TARGET_BNB);
        expect(proposal.launched).to.be.true; // graduated -> launched
    });

    it("Should reject pledges after graduation", async function () {
        await launchpad.connect(user1).createProposal("TestAgent", "TEST", "{}", TARGET_BNB);
        await launchpad.connect(user2).pledge(1n, { value: TARGET_BNB });

        await expect(
            launchpad.connect(user2).pledge(1n, { value: parseEther("1") })
        ).to.be.revertedWith("Already launched"); // "Already launched" instead of "Already graduated"
    });
});
