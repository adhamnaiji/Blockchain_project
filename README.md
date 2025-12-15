# 💎 DonationChain - Plateforme Décentralisée de Financement

> **Projet Académique** - Cours "Blockchain et Cryptographie"  
> Institut Supérieur d'Informatique et de Multimédia de Sfax (ISIMS)  
> Année Universitaire 2025-2026

Une plateforme Web3 transparente et sécurisée permettant de créer des campagnes de financement et de recevoir des donations en Ether sur la blockchain Ethereum.

## 📋 Table des Matières

- [Aperçu du Projet](#aperçu-du-projet)
- [Architecture](#architecture)
- [Fonctionnalités](#fonctionnalités)
- [Technologies Utilisées](#technologies-utilisées)
- [Installation](#installation)
- [Déploiement](#déploiement)
- [Utilisation](#utilisation)
- [Smart Contract](#smart-contract)
- [Tests](#tests)
- [Sécurité](#sécurité)

## 🎯 Aperçu du Projet

DonationChain est une plateforme de crowdfunding décentralisée qui permet:

- ✨ **Création de campagnes** de financement par donation en Ether
- 💰 **Donations transparentes** enregistrées sur la blockchain
- 🏆 **Système de récompenses** (Bronze, Silver, Gold) basé sur les montants
- 🔒 **Sécurité garantie** par les smart contracts Ethereum
- 💸 **Remboursements automatiques** si la campagne échoue
- ⚙️ **Gestion complète** (pause, reprise, retrait de fonds)

## 🏗️ Architecture

Le projet est divisé en deux parties principales:

### Smart Contract (Solidity)
```
contracts/
└── DonationPlatform.sol    # Contrat principal
```

### Frontend (React)
```
frontend/src/
├── components/              # Composants React
│   ├── ConnectWallet.jsx
│   ├── CampaignForm.jsx
│   ├── CampaignList.jsx
│   ├── CampaignDetail.jsx
│   ├── DonationHistory.jsx
│   └── CreatorDashboard.jsx
├── services/
│   ├── web3Service.js      # Intégration Web3
│   ├── contractABI.json
│   └── contractAddress.json
└── App.jsx
```

### Diagramme de Flux

\`\`\`mermaid
graph TD
    A[User] -->|1. Connect Wallet| B[MetaMask]
    B -->|2. Create Campaign| C[Smart Contract]
    A -->|3. Donate ETH| C
    C -->|4. Record Donation| D[Blockchain]
    C -->|5. Calculate Reward| E[Reward System]
    E -->|Bronze/Silver/Gold| A
    C -->|6. Goal Reached?| F{Check}
    F -->|Yes| G[Withdraw Funds]
    F -->|No + Expired| H[Refund Donors]
\`\`\`

### États d'une Campagne

\`\`\`mermaid
stateDiagram-v2
    [*] --> Open: Create Campaign
    Open --> Paused: Pause
    Paused --> Open: Resume
    Open --> Funded: Goal Reached
    Open --> Expired: Deadline Passed
    Funded --> [*]: Funds Withdrawn
    Expired --> [*]: Refunds Processed
\`\`\`

## ✨ Fonctionnalités

### 1. Création de Campagnes
- Titre et description personnalisables
- Définition d'un objectif en ETH
- Durée configurable en jours
- Enregistrement immuable sur la blockchain

### 2. Système de Donations
- Donations en Ether (ETH)
- Suivi transparent de chaque donation
- Calcul automatique des récompenses:
  - 🥉 **Bronze**: ≥ 0.1 ETH
  - 🥈 **Silver**: ≥ 0.5 ETH
  - 🥇 **Gold**: ≥ 1.0 ETH

### 3. Gestion des Campagnes (Créateur)
- ⏸️ Pause/Reprise de campagne
- 💰 Retrait des fonds (si objectif atteint)
- 📊 Tableau de bord avec statistiques
- 👥 Visualisation des donateurs

### 4. Remboursements Automatiques
- Déclenchés si campagne expirée ET objectif non atteint
- Montant total restitué à chaque donateur
- Pattern Checks-Effects-Interactions (CEI) pour la sécurité

### 5. Historique Complet
- Liste de toutes les donations
- Filtrage par campagne ou donateur
- Liens vers Etherscan pour vérification
- Export possible des données

## 🛠️ Technologies Utilisées

### Smart Contract
- **Solidity** ^0.8.20
- **Hardhat** - Développement et tests
- **OpenZeppelin** - Contrats sécurisés (ReentrancyGuard)
- **Ethers.js** v6 - Interaction blockchain

### Frontend
- **React** 18.x
- **React Router** - Navigation
- **Ethers.js** - Web3 provider
- **Tailwind CSS** - Styling moderne
- **React Toastify** - Notifications

### Blockchain
- **Sepolia Testnet** (ou Ganache local)
- **MetaMask** - Wallet Web3

## 📦 Installation

### Prérequis

- Node.js (v16 ou supérieur)
- npm ou yarn
- MetaMask installé dans le navigateur
- Git

### 1. Cloner le Projet

\`\`\`bash
git clone <repository-url>
cd projet
\`\`\`

### 2. Installation du Smart Contract

\`\`\`bash
# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env
\`\`\`

Modifier `.env` avec vos clés:
\`\`\`env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
\`\`\`

### 3. Installation du Frontend

\`\`\`bash
cd frontend
npm install
\`\`\`

## 🚀 Déploiement

### Option 1: Sepolia Testnet (Recommandé pour Production)

#### 1. Obtenir des Sepolia ETH
- Visitez [Sepolia Faucet](https://sepoliafaucet.com/)
- Entrez votre adresse MetaMask
- Attendez de recevoir les ETH de test

#### 2. Compiler le Smart Contract

\`\`\`bash
npx hardhat compile
\`\`\`

#### 3. Déployer sur Sepolia

\`\`\`bash
npx hardhat run scripts/deploy.js --network sepolia
\`\`\`

Le script va:
- Déployer le contrat
- Sauvegarder l'adresse et l'ABI dans `frontend/src/services/`
- Afficher l'adresse du contrat

#### 4. Vérifier sur Etherscan (Optionnel)

\`\`\`bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
\`\`\`

### Option 2: Réseau Local (Ganache/Hardhat)

#### 1. Lancer un nœud local

\`\`\`bash
npx hardhat node
\`\`\`

#### 2. Déployer localement

Dans un autre terminal:
\`\`\`bash
npx hardhat run scripts/deploy.js --network localhost
\`\`\`

#### 3. Configurer MetaMask
- Réseau: Localhost 8545
- Chain ID: 1337
- Importer un compte de test avec sa clé privée

## 🎮 Utilisation

### Lancer le Frontend

\`\`\`bash
cd frontend
npm start
\`\`\`

L'application sera disponible sur `http://localhost:3000`

### Guide d'Utilisation

#### 1. Connexion du Wallet
1. Cliquez sur "Connect Wallet"
2. Approuvez la connexion dans MetaMask
3. Assurez-vous d'être sur le réseau Sepolia

#### 2. Créer une Campagne
1. Allez dans "Create Campaign"
2. Remplissez le formulaire:
   - Titre
   - Description
   - Objectif en ETH
   - Durée en jours
3. Confirmez la transaction dans MetaMask
4. Attendez la confirmation

#### 3. Faire une Donation
1. Parcourez les campagnes dans "Campaigns"
2. Cliquez sur "View Details"
3. Entrez le montant en ETH
4. Le niveau de récompense s'affiche automatiquement
5. Cliquez sur "Donate Now"
6. Confirmez dans MetaMask

#### 4. Gérer vos Campagnes
1. Allez dans "Dashboard"
2. Visualisez vos statistiques
3. Gérez chaque campagne:
   - Pause/Resume
   - Withdraw (si objectif atteint)

#### 5. Demander un Remboursement
1. Allez sur la page de détail d'une campagne expirée
2. Si l'objectif n'est pas atteint, cliquez sur "Request Refund"
3. Confirmez la transaction

## 🔐 Smart Contract

### Structures de Données

#### Campaign
\`\`\`solidity
struct Campaign {
    uint id;
    address creator;
    string title;
    string description;
    uint goalAmount;
    uint deadline;
    uint collectedAmount;
    bool isPaused;
    bool isFunded;
    bool expired;
}
\`\`\`

#### Donation
\`\`\`solidity
struct Donation {
    address donor;
    uint amount;
    uint timestamp;
    uint rewardLevel;  // 0=none, 1=bronze, 2=silver, 3=gold
}
\`\`\`

### Fonctions Principales

#### createCampaign
\`\`\`solidity
function createCampaign(
    string memory title,
    string memory description,
    uint goalAmount,
    uint durationDays
) external
\`\`\`

#### donate
\`\`\`solidity
function donate(uint campaignId) external payable
\`\`\`

#### withdrawFunds
\`\`\`solidity
function withdrawFunds(uint campaignId) external
\`\`\`

#### requestRefund
\`\`\`solidity
function requestRefund(uint campaignId) external
\`\`\`

### Events

- `CampaignCreated(uint indexed campaignId, address indexed creator, uint goalAmount, uint deadline)`
- `DonationReceived(uint indexed campaignId, address indexed donor, uint amount, uint rewardLevel)`
- `CampaignPaused(uint indexed campaignId, address indexed creator)`
- `CampaignResumed(uint indexed campaignId, address indexed creator)`
- `FundsWithdrawn(uint indexed campaignId, address indexed creator, uint amount)`
- `RefundProcessed(uint indexed campaignId, address indexed donor, uint amount)`

## 🧪 Tests

### Lancer les Tests

\`\`\`bash
npx hardhat test
\`\`\`

### Couverture de Tests

Les tests couvrent:
- ✅ Création de campagnes (valide et invalide)
- ✅ Donations avec calcul de récompenses
- ✅ Pause/Resume de campagnes
- ✅ Retrait de fonds (CEI pattern)
- ✅ Remboursements
- ✅ Cas limites (expirations, états, etc.)
- ✅ Protection contre la reentrancy

### Exemple de Sortie

\`\`\`
DonationPlatform
    Campaign Creation
      ✓ Should create a campaign successfully (152ms)
      ✓ Should fail if goal amount is 0
      ✓ Should increment campaign counter
    Donations
      ✓ Should accept donations and calculate reward level correctly (412ms)
      ✓ Should update collected amount correctly
      ✓ Should fail if donation amount is 0
    Withdraw Funds
      ✓ Should allow creator to withdraw when goal is reached (345ms)
      ✓ Should fail if goal not reached
    Refunds
      ✓ Should allow refund when campaign expired and goal not reached (478ms)

  21 passing (4s)
\`\`\`

## 🔒 Sécurité

### Mesures de Sécurité Implémentées

#### 1. Reentrancy Guard
- Utilisation de `ReentrancyGuard` d'OpenZeppelin
- Protection contre les attaques de réentrance

#### 2. Checks-Effects-Interactions (CEI)
\`\`\`solidity
// ✅ Correct pattern
function withdrawFunds(uint campaignId) external {
    // CHECKS
    require(goalReached, "Goal not reached");
    
    // EFFECTS
    campaign.isFunded = true;
    
    // INTERACTIONS
    (bool success, ) = payable(msg.sender).call{value: amount}("");
    require(success, "Transfer failed");
}
\`\`\`

#### 3. Input Validation
- Vérification de tous les paramètres
- Montants > 0
- Adresses valides

#### 4. Access Control
- Modificateurs `onlyCreator`
- Vérifications d'existence de campagne

#### 5. État de Campagne
- Vérifications d'expiration
- États cohérents (paused, funded, expired)

## 📊 Statistiques du Projet

- **Lignes de code Solidity**: ~400
- **Lignes de code React**: ~2000+
- **Nombre de composants**: 6
- **Nombre de fonctions smart contract**: 12
- **Couverture de tests**: >90%

## 🤝 Contribution

Ce projet est un mini-projet académique. Pour toute suggestion:

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📧 Contact

**Projet réalisé dans le cadre du cours:**
- **Cours**: Blockchain et Cryptographie
- **Institution**: Institut Supérieur d'Informatique et de Multimédia de Sfax (ISIMS)
- **Année**: 2025-2026

## 🎓 Ressources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [React Documentation](https://react.dev/)
- [Sepolia Testnet Faucet](https://sepoliafaucet.com/)

## 🙏 Remerciements

- OpenZeppelin pour les contrats sécurisés
- Hardhat pour l'environnement de développement
- La communauté Ethereum pour la documentation

---

**Made with ❤️ for the Blockchain Course - ISIMS 2025-2026**
