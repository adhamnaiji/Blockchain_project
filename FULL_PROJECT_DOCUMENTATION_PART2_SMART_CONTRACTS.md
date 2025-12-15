# DOCUMENTATION PARTIE 2 : LES SMART CONTRACTS

Ce document analyse en détail le code Solidity du projet. C'est la partie "Blockchain" qui gère l'argent.

## Fichier : `contracts/DonationPlatform.sol`

C'est le cerveau du système. Il stocke l'argent et les règles.

### 1. Structure et Importations
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
```
*   **ReentrancyGuard** : Une protection de sécurité standard. Elle empêche une "Attaque de Réentrance" (où un pirate rappelle la fonction de retrait en boucle avant que son solde ne soit mis à jour).

### 2. Les Données (Structs)
```solidity
    struct Campaign {
        uint id;
        address creator;        // L'adresse de l'organisateur
        string title;
        string description;
        uint goalAmount;        // Objectif (en Wei)
        uint deadline;          // Date limite (Timestamp)
        uint collectedAmount;   // Argent récolté (en Wei)
        bool isPaused;
        bool isFunded;          // True = L'organisateur a retiré l'argent
        bool expired;
    }
```
*   C'est la fiche d'identité d'une campagne. Tout est stocké ici sur la Blockchain.

### 3. Les Fonctions Clés

#### `createCampaign` (Création)
```solidity
    function createCampaign(...) external {
        campaignCounter++;
        uint deadline = block.timestamp + (durationDays * 1 minutes); 
        // Note: "1 minutes" pour le test, normalement "1 days"
        
        campaigns[campaignCounter] = Campaign({ ... });
        emit CampaignCreated(...);
    }
```
*   **block.timestamp** : L'heure actuelle selon la Blockchain.
*   **emit** : Envoie un signal que le monde extérieur (notre site web) peut écouter.

#### `donate` (Dons)
```solidity
    function donate(uint campaignId) external payable campaignExists(campaignId) nonReentrant {
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        // On récupère la campagne
        Campaign storage campaign = campaigns[campaignId];
        
        // On augmente le compteur de la campagne
        campaign.collectedAmount += msg.value;
        
        // On enregistre le donateur
        campaignDonations[campaignId].push(Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            rewardLevel: rewardLevel
        }));
    }
```
*   **payable** : Permet à la fonction de recevoir de vrais Ethers.
*   **msg.value** : Le montant d'Ethers envoyé avec la transaction.

#### `withdrawFunds` (Retrait Sécurisé)
```solidity
    function withdrawFunds(uint campaignId) external onlyCreator(campaignId) nonReentrant {
        Campaign storage campaign = campaigns[campaignId];
        
        // 1. Checks (Vérifications)
        require(campaign.collectedAmount >= campaign.goalAmount, "Goal not reached yet");
        require(!campaign.isFunded, "Funds already withdrawn");
        
        // 2. Effects (Mise à jour de l'état)
        uint amount = campaign.collectedAmount;
        campaign.isFunded = true; // On marque comme payé AVANT d'envoyer
        
        // 3. Interactions (Envoi de l'argent)
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }
```
*   C'est la fonction la plus critique. Elle utilise le modèle **Check-Effects-Interactions** pour garantir que personne ne peut voler de fonds.

---
## Autres Contrats (Bonus)

### `DonorBadge.sol` (NFT)
```solidity
contract DonorBadge is ERC721, Ownable { ... }
```
*   C'est un contrat de NFT (Non-Fungible Token).
*   L'idée : Quand quelqu'un donne beaucoup, on peut lui "minter" (créer) un badge unique de récompense.

### `PlatformToken.sol` (ERC20)
```solidity
contract PlatformToken is ERC20 { ... }
```
*   C'est une monnaie interne (Token) pour la plateforme, potentiellement pour la gouvernance future.
