# DOCUMENTATION PARTIE 4 : LE FRONTEND (REACT & WEB3)

C'est l'interface visible par l'utilisateur. Elle a la lourde tâche de coordonner la Blockchain et le Backend.

## 1. Le Cœur Web3 (`services/web3Service.js`)
Ce fichier est le "pont" entre le navigateur et Ethereum.

### Connexion au Wallet
```javascript
export const connectWallet = async () => {
    // 1. Vérifie si MetaMask est installé
    if (typeof window.ethereum === "undefined") throw new Error(...);
    
    // 2. Demande l'accès au compte
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    
    // 3. Vérifie le réseau (Sepolia ou Localhost) et change si nécessaire
    // ... (Logique de changement de réseau) ...
    
    return accounts[0];
};
```

### Logique Hybride (Le "FallBack")
```javascript
export const getAllCampaigns = async () => {
    try {
        // TENTATIVE 1 : Le Backend (Ultra rapide)
        const response = await fetch('http://localhost:5000/api/campaigns');
        if (response.ok) return await response.json();
    } catch (err) {
        // ECHEC : Le backend est éteint ?
        console.warn("Backend down, switching to Blockchain...");
    }
    
    // TENTATIVE 2 : La Blockchain (Lent mais fiable)
    const contract = getReadOnlyContract();
    // ... Boucle pour lire chaque campagne sur la blockchain ...
};
```
*   C'est cette fonction intelligente qui rend l'appli robuste.

## 2. Les Composants React

### `CampaignForm.jsx` (Création)
*   **Rôle** : Formulaire pour créer une campagne.
*   **Flux** :
    1.  L'utilisateur remplit le formulaire (Titre, Montant, Durée).
    2.  `createCampaign()` est appelé (transaction Blockchain via MetaMask).
    3.  On attend la confirmation (`await tx.wait()`).
    4.  **Succès !** On envoie ensuite les données à l'API Backend (`POST /api/campaigns`) pour l'indexation.

### `CampaignList.jsx` (Affichage)
*   **Rôle** : Affiche la grille des campagnes.
*   **Calculs Locaux** :
    *   Le Frontend calcule lui-même la barre de progression : `(collected / goal) * 100`.
    *   Il calcule aussi le temps restant : `(deadline - maintenant)`.
    *   Il détermine le statut (Ouvert, Expiré, Financé) dynamiquement.

### `ConnectWallet.jsx` (Le Bouton)
*   Gère l'état de connexion. Affiche l'adresse abrégée (ex: `0x123...abc`) quand l'utilisateur est connecté.

## 3. Configuration (`tailwind.config.js` & `postcss`)
Nous utilisons TailwindCSS pour le style.
*   Cela permet d'écrire des styles directement dans les classes HTML (`className="bg-blue-500 text-white rounded"`).
*   Avantage : Développement très rapide et cohérence visuelle.
