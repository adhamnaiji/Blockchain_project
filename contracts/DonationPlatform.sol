// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DonationPlatform
 * @dev Plateforme décentralisée de financement par donation en Ether
 * @author Projet Blockchain - ISIMS 2025-2026
 */
contract DonationPlatform is ReentrancyGuard {
    
    // ========== STRUCTURES ==========
    
    struct Campaign {
        uint id;
        address creator;
        string title;
        string description;
        uint goalAmount;        // en wei
        uint deadline;          // timestamp UNIX
        uint collectedAmount;   // en wei
        bool isPaused;
        bool isFunded;
        bool expired;
    }
    
    struct Donation {
        address donor;
        uint amount;            // en wei
        uint timestamp;
        uint rewardLevel;       // 0=none, 1=bronze, 2=silver, 3=gold
    }
    
    // ========== STATE VARIABLES ==========
    
    mapping(uint => Campaign) public campaigns;
    mapping(uint => Donation[]) public campaignDonations;
    mapping(uint => mapping(address => uint)) public donorAmounts;
    uint public campaignCounter;
    
    // Reward thresholds (en wei)
    uint public constant BRONZE_THRESHOLD = 0.1 ether;
    uint public constant SILVER_THRESHOLD = 0.5 ether;
    uint public constant GOLD_THRESHOLD = 1.0 ether;
    
    // ========== EVENTS ==========
    
    event CampaignCreated(
        uint indexed campaignId,
        address indexed creator,
        uint goalAmount,
        uint deadline
    );
    
    event DonationReceived(
        uint indexed campaignId,
        address indexed donor,
        uint amount,
        uint rewardLevel
    );
    
    event CampaignPaused(
        uint indexed campaignId,
        address indexed creator
    );
    
    event CampaignResumed(
        uint indexed campaignId,
        address indexed creator
    );
    
    event FundsWithdrawn(
        uint indexed campaignId,
        address indexed creator,
        uint amount
    );
    
    event RefundProcessed(
        uint indexed campaignId,
        address indexed donor,
        uint amount
    );
    
    // ========== MODIFIERS ==========
    
    modifier onlyCreator(uint campaignId) {
        require(
            campaigns[campaignId].creator == msg.sender,
            "Only campaign creator can perform this action"
        );
        _;
    }
    
    modifier campaignExists(uint campaignId) {
        require(
            campaignId > 0 && campaignId <= campaignCounter,
            "Campaign does not exist"
        );
        _;
    }
    
    // ========== MAIN FUNCTIONS ==========
    
    /**
     * @dev Crée une nouvelle campagne de financement
     * @param title Titre de la campagne
     * @param description Description détaillée
     * @param goalAmount Montant objectif en wei
     * @param durationDays Durée en jours
     */
    function createCampaign(
        string memory title,
        string memory description,
        uint goalAmount,
        uint durationDays
    ) external {
        require(goalAmount > 0, "Goal amount must be greater than 0");
        require(durationDays > 0, "Duration must be greater than 0");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        
        campaignCounter++;
        uint deadline = block.timestamp + (durationDays * 1 days);
        
        campaigns[campaignCounter] = Campaign({
            id: campaignCounter,
            creator: msg.sender,
            title: title,
            description: description,
            goalAmount: goalAmount,
            deadline: deadline,
            collectedAmount: 0,
            isPaused: false,
            isFunded: false,
            expired: false
        });
        
        emit CampaignCreated(campaignCounter, msg.sender, goalAmount, deadline);
    }
    
    /**
     * @dev Effectue une donation à une campagne
     * @param campaignId ID de la campagne
     */
    function donate(uint campaignId) 
        external 
        payable 
        campaignExists(campaignId)
        nonReentrant 
    {
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        Campaign storage campaign = campaigns[campaignId];
        
        // Vérifier expiration
        _checkExpiration(campaignId);
        
        require(!campaign.expired, "Campaign has expired");
        require(!campaign.isPaused, "Campaign is paused");
        require(!campaign.isFunded, "Campaign is already funded");
        
        // Calculer le niveau de récompense
        uint rewardLevel = _calculateRewardLevel(msg.value);
        
        // Enregistrer la donation
        campaignDonations[campaignId].push(Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            rewardLevel: rewardLevel
        }));
        
        // Mettre à jour les montants
        donorAmounts[campaignId][msg.sender] += msg.value;
        campaign.collectedAmount += msg.value;
        
        emit DonationReceived(campaignId, msg.sender, msg.value, rewardLevel);
    }
    
    /**
     * @dev Met en pause une campagne
     * @param campaignId ID de la campagne
     */
    function pauseCampaign(uint campaignId) 
        external 
        campaignExists(campaignId)
        onlyCreator(campaignId)
    {
        Campaign storage campaign = campaigns[campaignId];
        require(!campaign.isPaused, "Campaign is already paused");
        require(!campaign.isFunded, "Cannot pause a funded campaign");
        require(!campaign.expired, "Cannot pause an expired campaign");
        
        campaign.isPaused = true;
        emit CampaignPaused(campaignId, msg.sender);
    }
    
    /**
     * @dev Reprend une campagne en pause
     * @param campaignId ID de la campagne
     */
    function resumeCampaign(uint campaignId) 
        external 
        campaignExists(campaignId)
        onlyCreator(campaignId)
    {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.isPaused, "Campaign is not paused");
        
        campaign.isPaused = false;
        emit CampaignResumed(campaignId, msg.sender);
    }
    
    /**
     * @dev Retire les fonds d'une campagne réussie
     * @param campaignId ID de la campagne
     */
    function withdrawFunds(uint campaignId) 
        external 
        campaignExists(campaignId)
        onlyCreator(campaignId)
        nonReentrant
    {
        Campaign storage campaign = campaigns[campaignId];
        
        require(
            campaign.collectedAmount >= campaign.goalAmount,
            "Goal not reached yet"
        );
        require(!campaign.isFunded, "Funds already withdrawn");
        
        uint amount = campaign.collectedAmount;
        
        // CEI Pattern: Checks done, now Effects
        campaign.isFunded = true;
        
        // CEI Pattern: Interactions last
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsWithdrawn(campaignId, msg.sender, amount);
    }
    
    /**
     * @dev Demande un remboursement pour une campagne échouée
     * @param campaignId ID de la campagne
     */
    function requestRefund(uint campaignId) 
        external 
        campaignExists(campaignId)
        nonReentrant
    {
        Campaign storage campaign = campaigns[campaignId];
        
        // Vérifier expiration
        _checkExpiration(campaignId);
        
        require(campaign.expired, "Campaign has not expired yet");
        require(
            campaign.collectedAmount < campaign.goalAmount,
            "Goal was reached, no refund available"
        );
        require(!campaign.isFunded, "Funds already withdrawn");
        
        uint donatedAmount = donorAmounts[campaignId][msg.sender];
        require(donatedAmount > 0, "No donation found for this address");
        
        // CEI Pattern: Effects
        donorAmounts[campaignId][msg.sender] = 0;
        
        // CEI Pattern: Interactions
        (bool success, ) = payable(msg.sender).call{value: donatedAmount}("");
        require(success, "Refund transfer failed");
        
        emit RefundProcessed(campaignId, msg.sender, donatedAmount);
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Retourne les détails d'une campagne
     * @param campaignId ID de la campagne
     */
    function getCampaign(uint campaignId) 
        external 
        view 
        campaignExists(campaignId)
        returns (
            uint id,
            address creator,
            string memory title,
            string memory description,
            uint goalAmount,
            uint deadline,
            uint collectedAmount,
            bool isPaused,
            bool isFunded,
            bool expired
        )
    {
        Campaign memory campaign = campaigns[campaignId];
        
        // Vérifier expiration
        bool isExpired = campaign.expired || (block.timestamp >= campaign.deadline);
        
        return (
            campaign.id,
            campaign.creator,
            campaign.title,
            campaign.description,
            campaign.goalAmount,
            campaign.deadline,
            campaign.collectedAmount,
            campaign.isPaused,
            campaign.isFunded,
            isExpired
        );
    }
    
    /**
     * @dev Retourne toutes les donations d'une campagne
     * @param campaignId ID de la campagne
     */
    function getCampaignDonations(uint campaignId) 
        external 
        view 
        campaignExists(campaignId)
        returns (Donation[] memory)
    {
        return campaignDonations[campaignId];
    }
    
    /**
     * @dev Retourne le montant donné par une adresse à une campagne
     * @param campaignId ID de la campagne
     * @param donor Adresse du donateur
     */
    function getDonorAmount(uint campaignId, address donor) 
        external 
        view 
        returns (uint)
    {
        return donorAmounts[campaignId][donor];
    }
    
    // ========== INTERNAL FUNCTIONS ==========
    
    /**
     * @dev Calcule le niveau de récompense basé sur le montant
     * @param amount Montant de la donation en wei
     */
    function _calculateRewardLevel(uint amount) internal pure returns (uint) {
        if (amount >= GOLD_THRESHOLD) {
            return 3; // Gold
        } else if (amount >= SILVER_THRESHOLD) {
            return 2; // Silver
        } else if (amount >= BRONZE_THRESHOLD) {
            return 1; // Bronze
        } else {
            return 0; // No reward
        }
    }
    
    /**
     * @dev Vérifie et met à jour le statut d'expiration
     * @param campaignId ID de la campagne
     */
    function _checkExpiration(uint campaignId) internal {
        Campaign storage campaign = campaigns[campaignId];
        if (block.timestamp >= campaign.deadline && !campaign.expired) {
            campaign.expired = true;
        }
    }
}
