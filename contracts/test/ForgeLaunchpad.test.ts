import { expect } from "chai";
import { ethers } from "hardhat";
import { ForgeLaunchpad } from "../typechain-types";

describe("ForgeLaunchpad", function () {
    let forgeLaunchpad: ForgeLaunchpad;
    let owner: any;
    let addr1: any;
    let addr2: any;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        const ForgeLaunchpadFactory = await ethers.getContractFactory("ForgeLaunchpad");
        forgeLaunchpad = await ForgeLaunchpadFactory.deploy(owner.address);
    });

    it("Should create a proposal", async function () {
        await forgeLaunchpad.createProposal("Agent Smith", "ASMITH", "ipfs://test", ethers.parseEther("5"));
        const proposal = await forgeLaunchpad.proposals(1);
        expect(proposal.name).to.equal("Agent Smith");
        expect(proposal.targetAmount).to.equal(ethers.parseEther("5"));
    });

    it("Should accept pledges", async function () {
        await forgeLaunchpad.createProposal("Agent Smith", "ASMITH", "ipfs://test", ethers.parseEther("5"));
        await forgeLaunchpad.connect(addr1).pledge(1, { value: ethers.parseEther("1") });
        const proposal = await forgeLaunchpad.proposals(1);
        expect(proposal.pledgedAmount).to.equal(ethers.parseEther("1"));
    });
});
