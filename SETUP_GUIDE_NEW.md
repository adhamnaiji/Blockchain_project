# Setup Guide - DonationChain

This guide explains how to set up and run the DonationChain project, including the new backend for persistence and smart contracts.

## Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (running locally)
- MetaMask extension installed in your browser

## 1. Database Setup
The project requires a PostgreSQL database to persist campaigns and donations.
**Default Credentials**:
- **Host**: localhost
- **Port**: 5432
- **User**: openpg
- **Password**: openpgpwd
- **Database**: donations_db

### Instructions
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the database (this creates the `donations_db` database and `campaigns` + `donations` tables):
   ```bash
   node create-db.js
   node init-db.js
   ```

## 2. Start the Backend Server
Keep this terminal open to run the backend server.
```bash
# Inside the backend directory
node server.js
```
The server will start on **http://localhost:5000**.

## 3. Start the Frontend Application
Open a new terminal window.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
The application will open at **http://localhost:3000**.

## 4. Smart Contracts
The project includes the following Solidity contracts in the `contracts/` directory:
- `DonationPlatform.sol`: Main logic.
- `DonorBadge.sol`: ERC721 NFT for donors.
- `PlatformToken.sol`: ERC20 Token.

To compile them:
```bash
npx hardhat compile
```

## 5. Using the Application
1. **Connect Wallet**: Click the "Connect Wallet" button in the top right.
2. **Create Campaign**: Go to "Create Campaign".
   - The campaign will be created on the blockchain AND saved to your local database.
3. **Donate**: Go to a campaign and make a donation.
   - The donation is recorded on the blockchain AND saved to your local database history.
4. **Persistence**: Refresh the page to see that your data remains available.

## Troubleshooting
- **Database Connection Error**: Ensure PostgreSQL is running and the credentials in `backend/db.js` (or `.env`) match your local setup.
- **Backend Not Reachable**: Ensure `node server.js` is running and port 5000 is not blocked.
- **MetaMask Issues**: Ensure you are connected to the Sepolia testnet (or Localhost if testing locally).
