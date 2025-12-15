# DOCUMENTATION PARTIE 3 : LE BACKEND (API & BASE DE DONNÉES)

Cette partie explique comment nous rendons l'application rapide grâce à un serveur Node.js et une base de données PostgreSQL.

## 1. Initialisation de la Base (`backend/init-db.js`)
Ce fichier configure la base de données au démarrage.

```javascript
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        blockchain_id INTEGER NOT NULL UNIQUE, -- Lien vital avec la Blockchain
        creator_address VARCHAR(42) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        goal_amount DECIMAL(18, 2) NOT NULL,
        duration_days INTEGER NOT NULL,
        transaction_hash VARCHAR(66) NOT NULL, -- Preuve de vérité
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ...
`;
```
*   **blockchain_id** : C'est la clé qui relie notre base de données "cache" à la "vraie" donnée sur Ethereum.
*   **transaction_hash** : On stocke la preuve que cette campagne existe bien sur la blockchain.

## 2. Le Serveur API (`backend/server.js`)
C'est le serveur web qui répond aux demandes du Frontend.

### Routes Principales

#### `GET /api/campaigns` (Lecture Rapide)
```javascript
app.get('/api/campaigns', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM campaigns ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) { ... }
});
```
*   **Pourquoi c'est important ?** Lire toutes les campagnes sur la Blockchain prendrait 10 à 30 secondes. Ici, cela prend **0.05 seconde** car on fait une simple requête SQL.

#### `POST /api/campaigns` (Synchronisation)
```javascript
app.post('/api/campaigns', async (req, res) => {
    const { blockchain_id, title, ... } = req.body;
    // ... Insert into DB ...
});
```
*   **Quand est-ce appelé ?** Cette route n'est appelée **QUE** lorsque la transaction Blockchain a réussi (succès confirmé par MetaMask).
*   C'est ainsi qu'on garde la base de données synchronisée avec la Blockchain.

## 3. Configuration de la Base (`backend/db.js`)
```javascript
const pool = new Pool({
    user: process.env.DB_USER || 'openpg',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'donations_db',
    // ...
});
```
*   Utilise `pg` (node-postgres) pour se connecter.
*   Utilise les variables d'environnement (`.env`) pour la sécurité (ne jamais mettre de mots de passe en dur !).
