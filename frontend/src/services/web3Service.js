/* global BigInt */
import { ethers } from "ethers";
import contractABI from "./contractABI.json";
import contractAddress from "./contractAddress.json";

// Configuration
const CONTRACT_ADDRESS = contractAddress.DonationPlatform;
const CONTRACT_ABI = contractABI;
const REQUIRED_NETWORK = contractAddress.network || "sepolia";
const REQUIRED_CHAIN_ID = contractAddress.chainId || 11155111; // Use dynamic chain ID from deployment

// Get provider and signer
let provider = null;
let signer = null;

/**
 * Initialize Web3 provider
 */
const getProvider = () => {
    if (typeof window.ethereum !== "undefined") {
        provider = new ethers.BrowserProvider(window.ethereum);
        return provider;
    }
    throw new Error("MetaMask is not installed");
};

/**
 * Ensure we are on the correct network
 */
const ensureCorrectNetwork = async () => {
    if (typeof window.ethereum === "undefined") return;

    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    const chainIdDecimal = parseInt(chainId, 16);

    if (chainIdDecimal !== REQUIRED_CHAIN_ID) {
        const hexChainId = "0x" + REQUIRED_CHAIN_ID.toString(16);
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: hexChainId }],
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [{
                            chainId: hexChainId,
                            chainName: "Localhost 8545",
                            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                            rpcUrls: ["http://127.0.0.1:8545"],
                        }],
                    });
                } catch (addError) {
                    throw new Error("Please add Localhost to MetaMask manually");
                }
            } else {
                throw switchError;
            }
        }
    }
};

/**
 * Get signer
 */
const getSigner = async () => {
    await ensureCorrectNetwork(); // Force network switch before getting signer
    const prov = getProvider();
    signer = await prov.getSigner();
    return signer;
};

/**
 * Connect wallet (MetaMask)
 */
export const connectWallet = async () => {
    try {
        if (typeof window.ethereum === "undefined") {
            throw new Error("MetaMask is not installed. Please install MetaMask to use this application.");
        }

        // Request account access
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });

        // Check network
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        const chainIdDecimal = parseInt(chainId, 16);

        if (chainIdDecimal !== REQUIRED_CHAIN_ID) {
            try {
                // Try to switch to Sepolia
                const hexChainId = "0x" + REQUIRED_CHAIN_ID.toString(16);
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: hexChainId }],
                });
            } catch (switchError) {
                // This error code indicates that the chain has not been added to MetaMask
                if (switchError.code === 4902) {
                    throw new Error("Please add Sepolia network to MetaMask");
                }
                throw switchError;
            }
        }

        return accounts[0];
    } catch (error) {
        console.error("Error connecting wallet:", error);
        throw error;
    }
};

/**
 * Get current account
 */
export const getCurrentAccount = async () => {
    try {
        const provider = getProvider();
        const accounts = await provider.listAccounts();
        return accounts.length > 0 ? accounts[0].address : null;
    } catch (error) {
        console.error("Error getting current account:", error);
        return null;
    }
};

/**
 * Get account balance
 */
export const getBalance = async (address) => {
    try {
        const provider = getProvider();
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
    } catch (error) {
        console.error("Error getting balance:", error);
        throw error;
    }
};

/**
 * Get contract instance
 */
export const getContractInstance = async () => {
    try {
        const signerInstance = await getSigner();
        return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerInstance);
    } catch (error) {
        console.error("Error getting contract instance:", error);
        throw error;
    }
};

/**
 * Get read-only contract instance
 */
export const getReadOnlyContract = () => {
    try {
        const provider = getProvider();
        return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    } catch (error) {
        console.error("Error getting read-only contract:", error);
        throw error;
    }
};

/**
 * Create a new campaign
 */
export const createCampaign = async (title, description, goalAmount, durationDays) => {
    try {
        const contract = await getContractInstance();
        const goalInWei = ethers.parseEther(goalAmount.toString());
        // Ensure durationDays is an integer
        const duration = BigInt(Math.floor(Number(durationDays)));

        const tx = await contract.createCampaign(title, description, goalInWei, duration);
        const receipt = await tx.wait();

        // Find the CampaignCreated event
        let event = receipt.logs.find(log => log.fragment && log.fragment.name === 'CampaignCreated');

        if (!event) {
            console.warn("Event not automatically parsed, attempting manual parsing...");
            try {
                // Manual parsing fallback
                const iface = new ethers.Interface(CONTRACT_ABI);
                for (const log of receipt.logs) {
                    try {
                        const parsed = iface.parseLog({
                            topics: [...log.topics],
                            data: log.data
                        });
                        if (parsed && parsed.name === 'CampaignCreated') {
                            event = { args: parsed.args };
                            break;
                        }
                    } catch (e) {
                        // Not this event
                    }
                }
            } catch (err) {
                console.error("Error during manual parsing:", err);
            }
        }

        if (!event) {
            console.error("CampaignCreated event STILL not found. Receipt logs:", receipt.logs);
            throw new Error("Campaign created but event not found. Check transaction logs in console.");
        }

        return {
            transactionHash: receipt.hash,
            campaignId: event.args[0], // Extract campaignId from event
        };
    } catch (error) {
        console.error("Error creating campaign:", error);
        throw error;
    }
};

/**
 * Donate to a campaign
 */
export const donate = async (campaignId, amountEth) => {
    try {
        const contract = await getContractInstance();
        const amountInWei = ethers.parseEther(amountEth.toString());

        const tx = await contract.donate(campaignId, { value: amountInWei });
        const receipt = await tx.wait();

        // Find the DonationReceived event
        const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'DonationReceived');
        const rewardLevel = event ? event.args[3] : 0; // Extract reward level from event

        // Save to backend
        try {
            await fetch('http://localhost:5000/api/donations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    campaign_id: Number(campaignId),
                    donor_address: await getCurrentAccount(),
                    amount: amountEth.toString(),
                    transaction_hash: receipt.hash,
                    reward_tier: Number(rewardLevel) // Send reward level to DB
                }),
            });
        } catch (backendError) {
            console.error("Error saving donation to backend:", backendError);
        }

        return {
            transactionHash: receipt.hash,
            rewardLevel: rewardLevel,
        };
    } catch (error) {
        console.error("Error donating:", error);
        throw error;
    }
};

/**
 * Pause a campaign
 */
export const pauseCampaign = async (campaignId) => {
    try {
        const contract = await getContractInstance();
        const tx = await contract.pauseCampaign(campaignId);
        const receipt = await tx.wait();
        return receipt.hash;
    } catch (error) {
        console.error("Error pausing campaign:", error);
        throw error;
    }
};

/**
 * Resume a campaign
 */
export const resumeCampaign = async (campaignId) => {
    try {
        const contract = await getContractInstance();
        const tx = await contract.resumeCampaign(campaignId);
        const receipt = await tx.wait();
        return receipt.hash;
    } catch (error) {
        console.error("Error resuming campaign:", error);
        throw error;
    }
};

/**
 * Withdraw funds from a campaign
 */
export const withdrawFunds = async (campaignId) => {
    try {
        const contract = await getContractInstance();
        const tx = await contract.withdrawFunds(campaignId);
        const receipt = await tx.wait();

        // Update backend
        try {
            await fetch(`http://localhost:5000/api/campaigns/${campaignId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_funded: true })
            });
        } catch (err) {
            console.error("Failed to update backend status:", err);
        }

        return receipt.hash;
    } catch (error) {
        console.error("Error withdrawing funds:", error);
        throw error;
    }
};

/**
 * Request refund
 */
export const requestRefund = async (campaignId) => {
    try {
        const contract = await getContractInstance();
        const tx = await contract.requestRefund(campaignId);
        const receipt = await tx.wait();
        return receipt.hash;
    } catch (error) {
        console.error("Error requesting refund:", error);
        throw error;
    }
};

/**
 * Get campaign details
 */
export const getCampaign = async (campaignId) => {
    try {
        // Try fetching from backend first
        try {
            const response = await fetch(`http://localhost:5000/api/campaigns/${campaignId}`);
            if (response.ok) {
                const c = await response.json();
                const deadline = Math.floor(new Date(c.created_at).getTime() / 1000) + (c.duration_days * 60);
                const now = Math.floor(Date.now() / 1000);

                return {
                    id: c.blockchain_id,
                    creator: c.creator_address,
                    title: c.title,
                    description: c.description,
                    goalAmount: c.goal_amount,
                    deadline: deadline,
                    collectedAmount: c.collected_amount ? c.collected_amount.toString() : "0",
                    isPaused: false,
                    isFunded: c.is_funded || false, // Read from DB
                    expired: now > deadline, // Calculate expiration client-side
                    fromDb: true
                };
            }
        } catch (err) {
            console.warn(`Backend unavailable for campaign ${campaignId}, falling back to blockchain...`, err);
        }

        const contract = getReadOnlyContract();
        const campaign = await contract.getCampaign(campaignId);

        return {
            id: Number(campaign[0]),
            creator: campaign[1],
            title: campaign[2],
            description: campaign[3],
            goalAmount: ethers.formatEther(campaign[4]),
            deadline: Number(campaign[5]),
            collectedAmount: ethers.formatEther(campaign[6]),
            isPaused: campaign[7],
            isFunded: campaign[8],
            expired: campaign[9],
        };
    } catch (error) {
        console.error("Error getting campaign:", error);
        throw error;
    }
};

/**
 * Get all campaigns
 */
export const getAllCampaigns = async () => {
    try {
        // Try fetching from backend first
        try {
            const response = await fetch('http://localhost:5000/api/campaigns');
            if (response.ok) {
                const campaigns = await response.json();
                return campaigns.map(c => ({
                    id: c.blockchain_id,
                    creator: c.creator_address,
                    title: c.title,
                    description: c.description,
                    goalAmount: c.goal_amount,
                    deadline: Math.floor(new Date(c.created_at).getTime() / 1000) + (c.duration_days * 60), // Approximate deadline reconstruction (Minutes for testing)
                    collectedAmount: c.collected_amount ? c.collected_amount.toString() : "0",
                    isPaused: false,
                    isFunded: false,
                    expired: false,
                    // Add a flag to indicate this is from DB
                    fromDb: true
                }));
            }
        } catch (err) {
            console.warn("Backend unavailable, falling back to blockchain...", err);
        }

        const contract = getReadOnlyContract();
        const campaignCounter = await contract.campaignCounter();
        const campaigns = [];

        for (let i = 1; i <= campaignCounter; i++) {
            const campaign = await getCampaign(i);
            campaigns.push(campaign);
        }

        return campaigns;
    } catch (error) {
        console.error("Error getting all campaigns:", error);
        throw error;
    }
};

/**
 * Get campaign donations
 */
export const getCampaignDonations = async (campaignId) => {
    try {
        // Try fetching from backend first
        try {
            const response = await fetch(`http://localhost:5000/api/campaigns/${campaignId}/donations`);
            if (response.ok) {
                const donations = await response.json();
                return donations.map(d => ({
                    donor: d.donor_address,
                    amount: d.amount, // It's stored as plain decimal string/number in DB
                    timestamp: Math.floor(new Date(d.created_at).getTime() / 1000), // Convert to unix timestamp for consistency
                    rewardLevel: d.reward_tier || 0, // Get from DB
                    isFromDb: true
                }));
            }
        } catch (err) {
            console.warn("Backend unavailable for donations, falling back to blockchain...", err);
        }

        const contract = getReadOnlyContract();
        const donations = await contract.getCampaignDonations(campaignId);

        return donations.map((donation) => ({
            donor: donation.donor,
            amount: ethers.formatEther(donation.amount),
            timestamp: Number(donation.timestamp),
            rewardLevel: Number(donation.rewardLevel),
        }));
    } catch (error) {
        console.error("Error getting campaign donations:", error);
        throw error;
    }
};

/**
 * Get donor amount for a campaign
 */
export const getDonorAmount = async (campaignId, donorAddress) => {
    try {
        const contract = getReadOnlyContract();
        const amount = await contract.getDonorAmount(campaignId, donorAddress);
        return ethers.formatEther(amount);
    } catch (error) {
        console.error("Error getting donor amount:", error);
        return "0";
    }
};

/**
 * Listen to donation events
 */
export const listenToDonationEvents = (campaignId, callback) => {
    try {
        const contract = getReadOnlyContract();

        const filter = contract.filters.DonationReceived(campaignId);

        contract.on(filter, (campaignId, donor, amount, rewardLevel, event) => {
            callback({
                campaignId: Number(campaignId),
                donor,
                amount: ethers.formatEther(amount),
                rewardLevel: Number(rewardLevel),
                blockNumber: event.log.blockNumber,
            });
        });

        // Return cleanup function
        return () => {
            contract.removeAllListeners(filter);
        };
    } catch (error) {
        console.error("Error listening to donation events:", error);
        throw error;
    }
};

/**
 * Listen to all campaign events
 */
export const listenToAllEvents = (callback) => {
    try {
        const contract = getReadOnlyContract();

        // Listen to all events
        contract.on("CampaignCreated", (...args) => callback({ type: "CampaignCreated", args }));
        contract.on("DonationReceived", (...args) => callback({ type: "DonationReceived", args }));
        contract.on("CampaignPaused", (...args) => callback({ type: "CampaignPaused", args }));
        contract.on("CampaignResumed", (...args) => callback({ type: "CampaignResumed", args }));
        contract.on("FundsWithdrawn", (...args) => callback({ type: "FundsWithdrawn", args }));
        contract.on("RefundProcessed", (...args) => callback({ type: "RefundProcessed", args }));

        // Return cleanup function
        return () => {
            contract.removeAllListeners();
        };
    } catch (error) {
        console.error("Error listening to events:", error);
        throw error;
    }
};

/**
 * Get reward level name
 */
export const getRewardLevelName = (level) => {
    switch (Number(level)) {
        case 0:
            return "None";
        case 1:
            return "Bronze";
        case 2:
            return "Silver";
        case 3:
            return "Gold";
        default:
            return "Unknown";
    }
};

/**
 * Calculate reward level from amount
 */
export const calculateRewardLevel = (amountEth) => {
    const amount = parseFloat(amountEth);
    if (amount >= 1.0) return { level: 3, name: "Gold" };
    if (amount >= 0.5) return { level: 2, name: "Silver" };
    if (amount >= 0.1) return { level: 1, name: "Bronze" };
    return { level: 0, name: "None" };
};

/**
 * Utility: Convert Wei to ETH
 */
export const convertWeiToEth = (wei) => {
    return ethers.formatEther(wei);
};

/**
 * Utility: Convert ETH to Wei
 */
export const convertEthToWei = (eth) => {
    return ethers.parseEther(eth.toString());
};

/**
 * Format address (short version)
 */
export const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Format timestamp to date
 */
export const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("fr-FR");
};

/**
 * Get days remaining
 */
export const getDaysRemaining = (deadline) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = deadline - now;
    if (diff <= 0) return 0;
    return Math.ceil(diff / (24 * 60 * 60));
};

/**
 * Get campaign status
 */
export const getCampaignStatus = (campaign) => {
    if (!campaign) return "Unknown";
    if (campaign.isPaused) return "Paused";
    if (campaign.isFunded) return "Funded";

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (campaign.expired || now >= campaign.deadline) return "Expired";

    // Check if goal reached but not expired/funded
    if (parseFloat(campaign.collectedAmount) >= parseFloat(campaign.goalAmount)) return "Goal Reached";

    return "Open";
};

/**
 * Get Etherscan URL
 */
export const getEtherscanUrl = (address, type = "address") => {
    return `https://sepolia.etherscan.io/${type}/${address}`;
};

export default {
    connectWallet,
    getCurrentAccount,
    getBalance,
    getContractInstance,
    getReadOnlyContract,
    createCampaign,
    donate,
    pauseCampaign,
    resumeCampaign,
    withdrawFunds,
    requestRefund,
    getCampaign,
    getAllCampaigns,
    getCampaignDonations,
    getDonorAmount,
    listenToDonationEvents,
    listenToAllEvents,
    getRewardLevelName,
    calculateRewardLevel,
    convertWeiToEth,
    convertEthToWei,
    formatAddress,
    formatDate,
    getDaysRemaining,
    getCampaignStatus,
    getEtherscanUrl,
};
