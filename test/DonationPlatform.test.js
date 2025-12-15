const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DonationPlatform", function () {
    let donationPlatform;
    let owner, creator, donor1, donor2;

    const GOAL_AMOUNT = ethers.parseEther("10"); // 10 ETH
    const DURATION_DAYS = 30;

    beforeEach(async function () {
        // Get signers
        [owner, creator, donor1, donor2] = await ethers.getSigners();

        // Deploy contract
        const DonationPlatform = await ethers.getContractFactory("DonationPlatform");
        donationPlatform = await DonationPlatform.deploy();
        await donationPlatform.waitForDeployment();
    });

    describe("Campaign Creation", function () {
        it("Should create a campaign successfully", async function () {
            await expect(
                donationPlatform.connect(creator).createCampaign(
                    "Test Campaign",
                    "This is a test campaign",
                    GOAL_AMOUNT,
                    DURATION_DAYS
                )
            )
                .to.emit(donationPlatform, "CampaignCreated")
                .withArgs(1, creator.address, GOAL_AMOUNT, await time.latest() + DURATION_DAYS * 24 * 60 * 60);

            const campaign = await donationPlatform.getCampaign(1);
            expect(campaign.title).to.equal("Test Campaign");
            expect(campaign.creator).to.equal(creator.address);
            expect(campaign.goalAmount).to.equal(GOAL_AMOUNT);
        });

        it("Should fail if goal amount is 0", async function () {
            await expect(
                donationPlatform.connect(creator).createCampaign(
                    "Test Campaign",
                    "Description",
                    0,
                    DURATION_DAYS
                )
            ).to.be.revertedWith("Goal amount must be greater than 0");
        });

        it("Should fail if duration is 0", async function () {
            await expect(
                donationPlatform.connect(creator).createCampaign(
                    "Test Campaign",
                    "Description",
                    GOAL_AMOUNT,
                    0
                )
            ).to.be.revertedWith("Duration must be greater than 0");
        });

        it("Should increment campaign counter", async function () {
            await donationPlatform.connect(creator).createCampaign("Campaign 1", "Desc", GOAL_AMOUNT, DURATION_DAYS);
            await donationPlatform.connect(creator).createCampaign("Campaign 2", "Desc", GOAL_AMOUNT, DURATION_DAYS);

            expect(await donationPlatform.campaignCounter()).to.equal(2);
        });
    });

    describe("Donations", function () {
        beforeEach(async function () {
            await donationPlatform.connect(creator).createCampaign(
                "Test Campaign",
                "Description",
                GOAL_AMOUNT,
                DURATION_DAYS
            );
        });

        it("Should accept donations and calculate reward level correctly", async function () {
            // Bronze reward (0.1 ETH)
            const bronzeAmount = ethers.parseEther("0.1");
            await expect(
                donationPlatform.connect(donor1).donate(1, { value: bronzeAmount })
            )
                .to.emit(donationPlatform, "DonationReceived")
                .withArgs(1, donor1.address, bronzeAmount, 1); // 1 = Bronze

            // Silver reward (0.5 ETH)
            const silverAmount = ethers.parseEther("0.5");
            await expect(
                donationPlatform.connect(donor2).donate(1, { value: silverAmount })
            )
                .to.emit(donationPlatform, "DonationReceived")
                .withArgs(1, donor2.address, silverAmount, 2); // 2 = Silver

            // Gold reward (1 ETH)
            const goldAmount = ethers.parseEther("1");
            await expect(
                donationPlatform.connect(donor1).donate(1, { value: goldAmount })
            )
                .to.emit(donationPlatform, "DonationReceived")
                .withArgs(1, donor1.address, goldAmount, 3); // 3 = Gold
        });

        it("Should update collected amount correctly", async function () {
            const donationAmount = ethers.parseEther("1");
            await donationPlatform.connect(donor1).donate(1, { value: donationAmount });

            const campaign = await donationPlatform.getCampaign(1);
            expect(campaign.collectedAmount).to.equal(donationAmount);
        });

        it("Should track donor amounts", async function () {
            const donation1 = ethers.parseEther("0.5");
            const donation2 = ethers.parseEther("1");

            await donationPlatform.connect(donor1).donate(1, { value: donation1 });
            await donationPlatform.connect(donor1).donate(1, { value: donation2 });

            const totalDonated = await donationPlatform.getDonorAmount(1, donor1.address);
            expect(totalDonated).to.equal(donation1 + donation2);
        });

        it("Should fail if donation amount is 0", async function () {
            await expect(
                donationPlatform.connect(donor1).donate(1, { value: 0 })
            ).to.be.revertedWith("Donation amount must be greater than 0");
        });

        it("Should fail if campaign is paused", async function () {
            await donationPlatform.connect(creator).pauseCampaign(1);

            await expect(
                donationPlatform.connect(donor1).donate(1, { value: ethers.parseEther("1") })
            ).to.be.revertedWith("Campaign is paused");
        });

        it("Should fail if campaign is expired", async function () {
            // Fast forward time beyond deadline
            await time.increase(DURATION_DAYS * 24 * 60 * 60 + 1);

            await expect(
                donationPlatform.connect(donor1).donate(1, { value: ethers.parseEther("1") })
            ).to.be.revertedWith("Campaign has expired");
        });
    });

    describe("Pause and Resume", function () {
        beforeEach(async function () {
            await donationPlatform.connect(creator).createCampaign(
                "Test Campaign",
                "Description",
                GOAL_AMOUNT,
                DURATION_DAYS
            );
        });

        it("Should allow creator to pause campaign", async function () {
            await expect(donationPlatform.connect(creator).pauseCampaign(1))
                .to.emit(donationPlatform, "CampaignPaused")
                .withArgs(1, creator.address);

            const campaign = await donationPlatform.getCampaign(1);
            expect(campaign.isPaused).to.be.true;
        });

        it("Should allow creator to resume campaign", async function () {
            await donationPlatform.connect(creator).pauseCampaign(1);

            await expect(donationPlatform.connect(creator).resumeCampaign(1))
                .to.emit(donationPlatform, "CampaignResumed")
                .withArgs(1, creator.address);

            const campaign = await donationPlatform.getCampaign(1);
            expect(campaign.isPaused).to.be.false;
        });

        it("Should fail if non-creator tries to pause", async function () {
            await expect(
                donationPlatform.connect(donor1).pauseCampaign(1)
            ).to.be.revertedWith("Only campaign creator can perform this action");
        });
    });

    describe("Withdraw Funds", function () {
        beforeEach(async function () {
            await donationPlatform.connect(creator).createCampaign(
                "Test Campaign",
                "Description",
                GOAL_AMOUNT,
                DURATION_DAYS
            );
        });

        it("Should allow creator to withdraw when goal is reached", async function () {
            // Donate enough to reach goal
            await donationPlatform.connect(donor1).donate(1, { value: GOAL_AMOUNT });

            const creatorBalanceBefore = await ethers.provider.getBalance(creator.address);

            const tx = await donationPlatform.connect(creator).withdrawFunds(1);
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;

            const creatorBalanceAfter = await ethers.provider.getBalance(creator.address);

            expect(creatorBalanceAfter).to.equal(creatorBalanceBefore + GOAL_AMOUNT - gasUsed);

            const campaign = await donationPlatform.getCampaign(1);
            expect(campaign.isFunded).to.be.true;
        });

        it("Should emit FundsWithdrawn event", async function () {
            await donationPlatform.connect(donor1).donate(1, { value: GOAL_AMOUNT });

            await expect(donationPlatform.connect(creator).withdrawFunds(1))
                .to.emit(donationPlatform, "FundsWithdrawn")
                .withArgs(1, creator.address, GOAL_AMOUNT);
        });

        it("Should fail if goal not reached", async function () {
            await donationPlatform.connect(donor1).donate(1, { value: ethers.parseEther("5") });

            await expect(
                donationPlatform.connect(creator).withdrawFunds(1)
            ).to.be.revertedWith("Goal not reached yet");
        });

        it("Should fail if non-creator tries to withdraw", async function () {
            await donationPlatform.connect(donor1).donate(1, { value: GOAL_AMOUNT });

            await expect(
                donationPlatform.connect(donor1).withdrawFunds(1)
            ).to.be.revertedWith("Only campaign creator can perform this action");
        });

        it("Should fail if already withdrawn", async function () {
            await donationPlatform.connect(donor1).donate(1, { value: GOAL_AMOUNT });
            await donationPlatform.connect(creator).withdrawFunds(1);

            await expect(
                donationPlatform.connect(creator).withdrawFunds(1)
            ).to.be.revertedWith("Funds already withdrawn");
        });
    });

    describe("Refunds", function () {
        beforeEach(async function () {
            await donationPlatform.connect(creator).createCampaign(
                "Test Campaign",
                "Description",
                GOAL_AMOUNT,
                DURATION_DAYS
            );
        });

        it("Should allow refund when campaign expired and goal not reached", async function () {
            const donationAmount = ethers.parseEther("5");
            await donationPlatform.connect(donor1).donate(1, { value: donationAmount });

            // Fast forward past deadline
            await time.increase(DURATION_DAYS * 24 * 60 * 60 + 1);

            const donorBalanceBefore = await ethers.provider.getBalance(donor1.address);

            const tx = await donationPlatform.connect(donor1).requestRefund(1);
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;

            const donorBalanceAfter = await ethers.provider.getBalance(donor1.address);

            expect(donorBalanceAfter).to.equal(donorBalanceBefore + donationAmount - gasUsed);
        });

        it("Should emit RefundProcessed event", async function () {
            const donationAmount = ethers.parseEther("5");
            await donationPlatform.connect(donor1).donate(1, { value: donationAmount });

            await time.increase(DURATION_DAYS * 24 * 60 * 60 + 1);

            await expect(donationPlatform.connect(donor1).requestRefund(1))
                .to.emit(donationPlatform, "RefundProcessed")
                .withArgs(1, donor1.address, donationAmount);
        });

        it("Should fail if campaign not expired", async function () {
            await donationPlatform.connect(donor1).donate(1, { value: ethers.parseEther("5") });

            await expect(
                donationPlatform.connect(donor1).requestRefund(1)
            ).to.be.revertedWith("Campaign has not expired yet");
        });

        it("Should fail if goal was reached", async function () {
            await donationPlatform.connect(donor1).donate(1, { value: GOAL_AMOUNT });

            await time.increase(DURATION_DAYS * 24 * 60 * 60 + 1);

            await expect(
                donationPlatform.connect(donor1).requestRefund(1)
            ).to.be.revertedWith("Goal was reached, no refund available");
        });

        it("Should fail if no donation found", async function () {
            await time.increase(DURATION_DAYS * 24 * 60 * 60 + 1);

            await expect(
                donationPlatform.connect(donor1).requestRefund(1)
            ).to.be.revertedWith("No donation found for this address");
        });
    });

    describe("Get Campaign Donations", function () {
        it("Should return all donations for a campaign", async function () {
            await donationPlatform.connect(creator).createCampaign(
                "Test Campaign",
                "Description",
                GOAL_AMOUNT,
                DURATION_DAYS
            );

            await donationPlatform.connect(donor1).donate(1, { value: ethers.parseEther("0.1") });
            await donationPlatform.connect(donor2).donate(1, { value: ethers.parseEther("0.5") });
            await donationPlatform.connect(donor1).donate(1, { value: ethers.parseEther("1") });

            const donations = await donationPlatform.getCampaignDonations(1);

            expect(donations.length).to.equal(3);
            expect(donations[0].donor).to.equal(donor1.address);
            expect(donations[0].rewardLevel).to.equal(1); // Bronze
            expect(donations[1].donor).to.equal(donor2.address);
            expect(donations[1].rewardLevel).to.equal(2); // Silver
            expect(donations[2].rewardLevel).to.equal(3); // Gold
        });
    });
});
