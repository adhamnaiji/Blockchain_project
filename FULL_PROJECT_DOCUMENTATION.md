# DOCUMENTATION COMPLÃˆTE DU PROJET : DONATIONCHAIN

Ce document est la rÃ©fÃ©rence ultime pour le projet **DonationPlatform**. Il dÃ©taille chaque aspect, de la conception initiale Ã  l'explication ligne par ligne du code final.

---

## 1. Vue d'ensemble et Architecture

### 1.1. Le Concept
**DonationChain** est une plateforme de crowdfunding (financement participatif) dÃ©centralisÃ©e. Elle permet Ã  niconque de :
1.  CrÃ©er une campagne de rÃ©colte de fonds.
2.  Recevoir des dons en Ethereum (ETH).
3.  Retirer les fonds une fois l'objectif atteint.

### 1.2. Architecture Technique (Hybride)
Pour rÃ©soudre les problÃ¨mes de lenteur de la Blockchain, nous utilisons une approche **Hybride** :
*   **Blockchain** : SÃ©curitÃ© financiÃ¨re, logique incassable.
*   **Base de DonnÃ©es (PostgreSQL)** : Affichage instantanÃ©, tri, filtrage.

#### Diagramme de Relation (Architecture)
```mermaid
graph TD
    Client[Client (React Frontend)]
    
    subgraph Blockchain Layer
        SC[Smart Contract (DonationPlatform.sol)]
        Eth[Ethereum Network (Sepolia/Local)]
    end
    
    subgraph Backend Layer
        API[Express API (Node.js)]
        DB[(PostgreSQL Database)]
    end
    
    %% Flows
    Client -- 1. Lit les donnÃ©es (Ultra Rapide) --> API
    API -- RequÃªte SQL --> DB
    
    Client -- 2. Envoie Transaction (SÃ©curisÃ©) --> SC
    SC -- Stocke fonds --> Eth
    
    %% Sync
    Client -- 3. Notifie succÃ¨s --> API
    API -- Sauvegarde copie --> DB
```

### 1.3. Technologies UtilisÃ©es
1.  **Solidity** (v0.8.20) : Langage pour Ã©crire le Smart Contract.
2.  **Hardhat** : Environnement de dÃ©veloppement pour compiler, tester et dÃ©ployer le contrat.
3.  **React.js (Vite)** : Framework Frontend pour l'interface utilisateur.
4.  **TailwindCSS** : Framework CSS pour le design rapide.
5.  **Node.js & Express** : Serveur Backend.
6.  **PostgreSQL** : Base de donnÃ©es relationnelle.
7.  **Ethers.js** : Librairie JS pour que le Frontend parle Ã  la Blockchain.

---

## 2. Guide de "Reconstruction" (Step-by-Step)

Voici les commandes exactes et les Ã©tapes que nous avons suivies pour crÃ©er ce projet de A Ã  Z.

### Ã‰tape 1 : Initialisation du Projet Blockchain
Nous avons commencÃ© par le cÅ“ur du systÃ¨me : les contrats.

```bash
# 1. CrÃ©er le dossier racine
mkdir donation-platform
cd donation-platform

# 2. Initialiser Hardhat
npm init -y
npm install --save-dev hardhat
npx hardhat init
# > Choisir "Create a JavaScript project"

# 3. Installer les extensions utiles
npm install --save-dev @openzeppelin/contracts dotenv
```

### Ã‰tape 2 : CrÃ©ation du Backend
Ensuite, nous avons mis en place le serveur pour stocker les donnÃ©es.

```bash
# 1. CrÃ©er dossier backend
mkdir backend
cd backend

# 2. Initialiser Node.js
npm init -y

# 3. Installer les dÃ©pendances
npm install express pg cors dotenv
npm install --save-dev nodemon
```
*Ici, nous avons crÃ©Ã© `server.js` et configurÃ© la connexion PostgreSQL.*

### Ã‰tape 3 : CrÃ©ation du Frontend
Enfin, l'interface pour les utilisateurs.

```bash
# Revenue Ã  la racine
cd ..

# 1. CrÃ©er le projet React avec Vite
npm create vite@latest frontend -- --template react
cd frontend

# 2. Installer TailwindCSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. Installer les librairies Web3
npm install ethers react-router-dom react-toastify
```

### Ã‰tape 4 : La Connexion (Le "Binding")
C'est l'Ã©tape cruciale oÃ¹ nous avons :
1.  CompilÃ© le contrat : `npx hardhat compile`
2.  DÃ©ployÃ© le contrat : `npx hardhat run scripts/deploy.js`
3.  CopiÃ© l'adresse et l'ABI (l'interface du contrat) vers le frontend (`frontend/src/services`).

---

## 3. Analyse Approfondie : Smart Contracts

Le cœur de la sécurité. Voici l'explication ligne par ligne du fichier contracts/DonationPlatform.sol.

### 3.1. En-têtes et Configuration
\\\solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
\\\
*   **SPDX** : Licence open-source (MIT).
*   **pragma** : Définit la version du compilateur (0.8.0 ou plus).
*   **import** : Nous importons ReentrancyGuard. C'est un mécanisme de sécurité crucial qui empêche un attaquant d'appeler plusieurs fois une fonction de retrait avant que le solde ne soit mis à jour (attaque de réentrance classique).

### 3.2. Structures de Données
\\\solidity
    struct Campaign {
        uint id;                // Identifiant unique (1, 2, 3...)
        address creator;        // L'adresse (compte) de celui qui a créé la campagne
        string title;           // Titre de la campagne
        string description;     // Description
        uint goalAmount;        // Objectif en Wei (1 ETH = 10^18 Wei)
        uint deadline;          // Date de fin (Timestamp UNIX en secondes)
        uint collectedAmount;   // Montant déjà récolté
        bool isPaused;          // Sécurité : permet de geler la campagne
        bool isFunded;          // Est-ce que l'argent a déjà été retiré ?
        bool expired;           // Est-ce que la date est passée ?
    }
\\\
*   **struct** : C'est comme une "classe" ou un "objet" en JavaScript. Cela définit la forme d'une Campagne.
*   **uint** : Unsigned Integer (entier positif uniquement). On l'utilise pour l'argent car il n'y a pas de centimes négatifs.

### 3.3. Stockage (State Variables)
\\\solidity
    mapping(uint => Campaign) public campaigns;
    mapping(uint => Donation[]) public campaignDonations;
    uint public campaignCounter;
\\\
*   **mapping** : C'est une table de hachage (dictionnaire).
    *   campaigns : Si je donne l'ID 1, il me rend les infos de la campagne 1.
    *   campaignDonations : Si je donne l'ID 1, il me rend la liste de tous les dons de cette campagne.
*   **campaignCounter** : Compteur global. À chaque création, on fait +1 pour avoir un ID unique.

### 3.4. Fonction : createCampaign
\\\solidity
    function createCampaign(
        string memory title,
        string memory description,
        uint goalAmount,
        uint durationDays
    ) external {
        // ... (Verifications require) ...
        
        campaignCounter++;
        // Calcul de la date de fin = Maintenant + Durée
        uint deadline = block.timestamp + (durationDays * 1 minutes); // Modifié pour TEST
        
        campaigns[campaignCounter] = Campaign({
            id: campaignCounter,
            creator: msg.sender, // msg.sender est l'adresse de celui qui appelle la fonction
            // ... autres champs
        });
        
        emit CampaignCreated(...); // Notifie le Frontend qu'il s'est passé quelque chose
    }
\\\
*   **external** : Cette fonction peut être appelée depuis l'extérieur (le site web), mais pas depuis l'intérieur du contrat (économie de gaz).
*   **msg.sender** : Variable magique globale qui contient l'adresse du portefeuille qui a signé la transaction.
*   **emit** : Lance un événement. C'est comme un console.log qui est écrit éternellement sur la Blockchain.

### 3.5. Fonction : donate
\\\solidity
    function donate(uint campaignId) 
        external 
        payable           // <--- IMPORTANT : Autorise la réception d'argent
        campaignExists(campaignId)
        nonReentrant      // <--- SÉCURITÉ : Bloque les appels récursifs
    {
        require(msg.value > 0, "Amount must be > 0"); // msg.value est le montant envoyé
        
        Campaign storage campaign = campaigns[campaignId];
        // ... Verifications ...
        
        // Mise à jour des compteurs
        campaign.collectedAmount += msg.value;
        
        // Enregistrement
        campaignDonations[campaignId].push(Donation({
            donor: msg.sender,
            amount: msg.value,
            // ...
        }));
    }
\\\
*   **payable** : Sans ce mot-clé, la fonction rejetterait automatiquement tout envoi d'argent.
*   **storage** : Indique qu'on manipule directement la base de données de la Blockchain (modification permanente).

### 3.6. Fonction : withdrawFunds (Le Retrait)
\\\solidity
    function withdrawFunds(uint campaignId) 
        external 
        onlyCreator(campaignId)  // Seul le créateur peut retirer
        nonReentrant
    {
        Campaign storage campaign = campaigns[campaignId];
        
        // Vérification que l'objectif est atteint
        require(campaign.collectedAmount >= campaign.goalAmount, "Goal not reached");
        
        uint amount = campaign.collectedAmount;
        campaign.isFunded = true; // Marque comme payé AVANT d'envoyer (Sécurité CEI)
        
        // Envoi de l'argent
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }
\\\
*   **Pattern CEI** (Checks-Effects-Interactions) :
    1.  **Checks** (equire) : On vérifie les droits.
    2.  **Effects** (isFunded = true) : On met à jour l'état.
    3.  **Interactions** (.call{value: amount}) : On envoie l'argent à la fin.
    *Pourquoi ?* Si on envoyait l'argent avant de mettre à jour isFunded, un pirate pourrait rappeler la fonction avant qu'elle ne finisse et vider le compte (Attaque Reentrancy).

