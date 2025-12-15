# Rapport Technique Détaillé : DonationChain

Ce document présente une analyse complète de la plateforme de donation décentralisée **DonationChain**. Il détaille l'architecture, le processus de développement, et fournit une analyse technique approfondie de chaque composant avec le code source associé.

---

## 1. Vue d'ensemble du Projet

**DonationChain** est une application hybride (DApp) qui combine la transparence et la sécurité de la Blockchain Ethereum avec la rapidité d'une base de données traditionnelle (PostgreSQL).

### Objectif
Permettre aux utilisateurs de :
1.  **Créer des campagnes de financement** transparentes.
2.  **Faire des dons** en Ethereum (ETH) de manière sécurisée.
3.  **Recevoir des récompenses** (Badges NFT, Rangs) selon le montant donné.
4.  **Suivre l'évolution** des fonds en temps réel.

### Architecture Hybride
Le projet utilise une architecture innovante pour pallier les lenteurs de la blockchain :
*   **Blockchain (Vérité)** : Stocke les fonds, valide les transactions, gère la logique critique (Smart Contracts).
*   **Base de Données (Cache/Performance)** : Indexe les campagnes et les dons pour un affichage instantané sur le site web.

---

## 2. Étapes de Réalisation

Voici les étapes chronologiques suivies pour construire ce projet :

### Phase 1 : Développement Blockchain (Backend Web3)
1.  **Conception des Contrats** : Définition des structures de données (`Campaign`, `Donation`) en Solidity.
2.  **Logique Métier** : Implémentation des fonctions `createCampaign`, `donate`, `withdrawFunds`.
3.  **Sécurité** : Ajout de `ReentrancyGuard` et du pattern CEI (Checks-Effects-Interactions) pour prévenir les piratages.
4.  **Tests** : Déploiement sur le réseau de test **Sepolia** via Hardhat.

### Phase 2 : Développement Backend (API & Base de Données)
1.  **Persistence** : Création d'une base PostgreSQL pour stocker une copie locale des données.
2.  **API REST** : Développement d'un serveur Express.js pour servir les données au Frontend rapidement.
3.  **Synchronisation** : Mise en place d'un système où chaque transaction Blockchain réussie est immédiatement enregistrée dans la base de données.

### Phase 3 : Développement Frontend (Interface Utilisateur)
1.  **React & Vite** : Création d'une interface moderne et réactive.
2.  **Intégration Web3** : Connexion avec MetaMask via `ethers.js`.
3.  **Logique Hybride** : Le site lit les données depuis l'API (rapide) mais écrit (transactions) sur la Blockchain (sécurisé).

---

## 3. Analyse Détaillée et Code des Fichiers

### 3.1. Smart Contracts
Les contrats intelligents sont le cœur de la sécurité du projet.

#### A. `contracts/DonationPlatform.sol`
**Description** : C'est le contrat principal. Il gère la création des campagnes, la réception des dons, et le retrait des fonds.
*   **Points clés** : Utilise `ReentrancyGuard` pour la sécurité. Stocke les campagnes dans un `mapping`. Emet des événements (`CampaignCreated`, `DonationReceived`) écoutés par le frontend.

```solidity
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
    
    function getCampaignDonations(uint campaignId) 
        external 
        view 
        campaignExists(campaignId)
        returns (Donation[] memory)
    {
        return campaignDonations[campaignId];
    }
    
    function getDonorAmount(uint campaignId, address donor) 
        external 
        view 
        returns (uint)
    {
        return donorAmounts[campaignId][donor];
    }
    
    // ========== INTERNAL FUNCTIONS ==========
    
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
    
    function _checkExpiration(uint campaignId) internal {
        Campaign storage campaign = campaigns[campaignId];
        if (block.timestamp >= campaign.deadline && !campaign.expired) {
            campaign.expired = true;
        }
    }
}
```

---

### 3.2. Backend (Node.js & PostgreSQL)
Le backend sert de "mémoire rapide" pour l'application.

#### A. `backend/init-db.js`
**Description** : Script d'initialisation qui crée les tables `campaigns` et `donations` si elles n'existent pas.
*   **Tables** :
    *   `campaigns` : Stocke les métadonnées (titre, description) et le hash de transaction.
    *   `donations` : Historique des dons lié aux campagnes.

```javascript
const fs = require('fs');
const path = require('path');
const pool = require('./db');

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        blockchain_id INTEGER NOT NULL UNIQUE,
        creator_address VARCHAR(42) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        goal_amount DECIMAL(18, 2) NOT NULL,
        duration_days INTEGER NOT NULL,
        transaction_hash VARCHAR(66) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS donations (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER NOT NULL,
        donor_address VARCHAR(42) NOT NULL,
        amount DECIMAL(18, 4) NOT NULL,
        transaction_hash VARCHAR(66) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(blockchain_id)
    );
`;

const initDb = async () => {
    try {
        await pool.query(createTableQuery);
        console.log('Campaigns table created or already exists.');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        pool.end();
    }
};

initDb();
```

#### B. `backend/server.js`
**Description** : API REST qui fournit les données au Frontend.
*   `GET /api/campaigns` : Récupère rapidement toutes les campagnes.
*   `POST /api/campaigns` : Sauvegarde une campagne après sa création sur la Blockchain.

```javascript
const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Get all campaigns
app.get('/api/campaigns', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM campaigns ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new campaign (called after blockchain tx)
app.post('/api/campaigns', async (req, res) => {
    const { blockchain_id, creator_address, title, description, goal_amount, duration_days, transaction_hash } = req.body;

    if (blockchain_id === undefined || !creator_address || !title || !description || !goal_amount || !duration_days || !transaction_hash) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const query = `
            INSERT INTO campaigns (blockchain_id, creator_address, title, description, goal_amount, duration_days, transaction_hash)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [blockchain_id, creator_address, title, description, goal_amount, duration_days, transaction_hash];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Campaign already exists' });
        }
        res.status(500).json({ error: 'Server error' });
    }
});

// ... (endpoints donations omit pour brièveté, voir code complet)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

---

### 3.3. Frontend Integration
Le Frontend est le chef d'orchestre de cette architecture hybride.

#### A. `frontend/src/services/web3Service.js`
**Description** : Ce fichier contient toute la logique de connexion.
*   **Hybride** : Pour `getAllCampaigns`, il tente d'abord de lire depuis l'API locale (`fetch`). Si l'API échoue, il se replie sur la Blockchain.
*   **Écriture** : Pour `createCampaign` et `donate`, il interagit toujours directement avec le Smart Contract pour la sécurité.

```javascript
// Extrait pertinent de la logique hybride
export const getAllCampaigns = async () => {
    try {
        // 1. Essayer le Backend
        try {
            const response = await fetch('http://localhost:5000/api/campaigns');
            if (response.ok) {
                const campaigns = await response.json();
                return campaigns.map(c => ({
                    // Mapping DB -> Frontend Model
                    id: c.blockchain_id,
                    title: c.title,
                    // ...
                    fromDb: true
                }));
            }
        } catch (err) {
            console.warn("Backend unavailable, falling back to blockchain...", err);
        }

        // 2. Repli sur la Blockchain si Backend HS
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
```

---

## Conclusion
Ce projet démontre une application blockchain complète et réaliste. L'utilisation conjointe de Solidity pour la sécurité des fonds et de PostgreSQL pour la performance de l'interface utilisateur offre une expérience optimale, résolvant les problèmes courants de lenteur des DApps traditionnelles.
