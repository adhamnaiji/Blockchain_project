# 🚀 Complete Setup Guide - DonationChain Platform

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] **Node.js** installed (v16 or higher) - [Download here](https://nodejs.org/)
- [ ] **Git** installed - [Download here](https://git-scm.com/)
- [ ] **MetaMask** browser extension - [Install here](https://metamask.io/download/)
- [ ] **Code editor** (VS Code recommended)

---

## 🔧 Step 1: Initial Setup (5 minutes)

### 1.1 Open Terminal/PowerShell

Navigate to your project folder:

```powershell
cd c:\Users\adhem\OneDrive\Bureau\Course\blockchain\projet
```

### 1.2 Install Root Dependencies

```powershell
npm install
```

This installs Hardhat, OpenZeppelin, and testing tools.

**Expected output:** 
```
added 500+ packages in 30s
```

### 1.3 Install Frontend Dependencies

```powershell
cd frontend
npm install
```

This installs React, ethers.js, Tailwind CSS, etc.

**Expected output:**
```
added 1400+ packages in 45s
```

Return to project root:
```powershell
cd ..
```

---

## 🔑 Step 2: Get Required API Keys (10 minutes)

### 2.1 Get Infura API Key (For Sepolia Network)

1. **Go to:** https://infura.io/
2. **Click:** "Sign Up" (or login if you have an account)
3. **Create a new project:**
   - Click "Create New Key"
   - Select "Web3 API"
   - Name it: "DonationPlatform"
4. **Copy your API Key:**
   - Look for "API Key" in the project dashboard
   - It looks like: `abc123def456ghi789...`

**Alternative:** Use Alchemy instead
- Go to: https://www.alchemy.com/
- Create account and new app
- Select "Ethereum" → "Sepolia"
- Copy the API Key

### 2.2 Get Sepolia ETH (Test Currency)

1. **Open MetaMask** and copy your wallet address (0x...)
2. **Visit a Sepolia Faucet:**
   - Option 1: https://sepoliafaucet.com/
   - Option 2: https://www.alchemy.com/faucets/ethereum-sepolia
   - Option 3: https://faucet.quicknode.com/ethereum/sepolia
3. **Paste your address** and request test ETH
4. **Wait 1-2 minutes** for ETH to arrive in your wallet

### 2.3 Get Your MetaMask Private Key

⚠️ **IMPORTANT: NEVER share this key! Only use it for test accounts!**

1. **Open MetaMask**
2. Click the **three dots** (⋮) next to your account
3. Click **"Account details"**
4. Click **"Show private key"**
5. **Enter your MetaMask password**
6. **Copy the private key** (64 characters, starts with 0x)

### 2.4 Get Etherscan API Key (Optional, for verification)

1. **Go to:** https://etherscan.io/
2. **Sign up** for a free account
3. **Go to:** "My Profile" → "API Keys"
4. **Create a new API key**
5. **Copy the key**

---

## 📝 Step 3: Configure Environment Variables (5 minutes)

### 3.1 Create .env File

In the **project root** folder, create a file named `.env` (no extension):

**On Windows (PowerShell):**
```powershell
# Make sure you're in the project root
cd c:\Users\adhem\OneDrive\Bureau\Course\blockchain\projet

# Create .env file
New-Item -Path .env -ItemType File
```

### 3.2 Add Your Keys to .env File

Open `.env` in your code editor and add:

```env
# Sepolia RPC URL (use your Infura or Alchemy key)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY_HERE

# Your MetaMask private key (from Step 2.3)
PRIVATE_KEY=your_private_key_here_without_0x

# Etherscan API key (optional, for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key

# Gas reporter (leave as false)
REPORT_GAS=false
```

**Example with real values:**
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/abc123def456ghi789jkl
PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
ETHERSCAN_API_KEY=ABC123DEF456GHI789
REPORT_GAS=false
```

**Save the file!**

---

## 🧪 Step 4: Test the Smart Contract (3 minutes)

### 4.1 Compile the Contract

```powershell
npx hardhat compile
```

**Expected output:**
```
Compiled 1 Solidity file successfully
```

### 4.2 Run Tests

```powershell
npx hardhat test
```

**Expected output:**
```
  DonationPlatform
    Campaign Creation
      ✓ Should create a campaign successfully (152ms)
      ✓ Should fail if goal amount is 0
      ... (more tests)

  21 passing (4s)
```

If all tests pass ✅, you're ready to deploy!

---

## 🚀 Step 5: Deploy to Sepolia Testnet (3 minutes)

### 5.1 Verify Your Wallet Balance

Make sure you have Sepolia ETH in your wallet (from Step 2.2)

### 5.2 Deploy the Contract

```powershell
npx hardhat run scripts/deploy.js --network sepolia
```

**Expected output:**
```
🚀 Deploying DonationPlatform contract...

⏳ Deployment in progress...
✅ DonationPlatform deployed to: 0x1234567890abcdef...
📡 Network: sepolia (chainId: 11155111)
👤 Deployed by: 0xYourAddress...
💰 Deployer balance: 0.9999 ETH

💾 Contract address and ABI saved to frontend/src/services/

📋 Next steps:
1. Copy the contract address: 0x1234567890abcdef...
2. Verify on Etherscan (if on testnet):
   npx hardhat verify --network sepolia 0x1234567890abcdef...
3. Navigate to frontend and run: npm install && npm start

✨ Deployment complete!
```

**Important:** Copy the contract address (0x...) - you'll need it!

### 5.3 Verify on Etherscan (Optional but Recommended)

```powershell
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
```

Replace `YOUR_CONTRACT_ADDRESS` with the address from step 5.2.

---

## 💻 Step 6: Launch the Frontend (2 minutes)

### 6.1 Navigate to Frontend Folder

```powershell
cd frontend
```

### 6.2 Start the Development Server

```powershell
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view donation-platform-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.x:3000
```

### 6.3 Open in Browser

Your browser should automatically open to: **http://localhost:3000**

If not, manually open: http://localhost:3000

---

## 🎮 Step 7: Configure MetaMask for the App (2 minutes)

### 7.1 Switch to Sepolia Network

In MetaMask:
1. Click the **network dropdown** (top of MetaMask)
2. Select **"Sepolia test network"**
3. If you don't see it, click "Show/hide test networks" in settings

### 7.2 Connect Wallet to the App

1. On the website, click **"Connect Wallet"** button
2. MetaMask will pop up
3. Click **"Next"** → **"Connect"**
4. You should see your address and balance

---

## ✅ Step 8: Test the Application (10 minutes)

### 8.1 Create Your First Campaign

1. Click **"Create"** in the navigation
2. Fill in the form:
   - **Title:** "Test Campaign 1"
   - **Description:** "This is my first blockchain campaign"
   - **Goal Amount:** 1 (ETH)
   - **Duration:** 30 (days)
3. Click **"Create Campaign"**
4. **Confirm** the transaction in MetaMask
5. Wait for confirmation (10-30 seconds)

### 8.2 Make a Donation

1. Go to **"Campaigns"** page
2. Click **"View Details"** on your campaign
3. Enter donation amount: **0.1** ETH (for Bronze reward)
4. Click **"Donate Now"**
5. **Confirm** in MetaMask
6. Wait for confirmation

### 8.3 Check Your Dashboard

1. Click **"Dashboard"** in navigation
2. You should see:
   - Total campaigns: 1
   - Total collected: 0.1 ETH
   - Unique donors: 1

### 8.4 View Donation History

1. Click **"History"** in navigation
2. You should see your donation listed

---

## 🔍 Step 9: Verify on Blockchain Explorer (Optional)

### 9.1 View Your Contract on Etherscan

1. Go to: https://sepolia.etherscan.io/
2. Paste your **contract address** in the search bar
3. You can see all transactions and contract code

### 9.2 View Your Transactions

1. Click on any transaction hash from the app
2. Or find them in the contract's "Transactions" tab
3. You can see gas used, block number, etc.

---

## 🎯 Quick Reference Commands

### If You Need to Start Over:

**Stop the frontend:**
```powershell
Ctrl + C
```

**Clean and reinstall:**
```powershell
# In project root
rm -r node_modules
rm package-lock.json
npm install

# In frontend folder
cd frontend
rm -r node_modules
rm package-lock.json
npm install
```

### Run Everything Again:

```powershell
# Terminal 1 - Project root
cd c:\Users\adhem\OneDrive\Bureau\Course\blockchain\projet
npx hardhat test

# Terminal 2 - Frontend
cd c:\Users\adhem\OneDrive\Bureau\Course\blockchain\projet\frontend
npm start
```

---

## 🐛 Troubleshooting

### Issue: "Module not found" error

**Solution:**
```powershell
npm install
cd frontend
npm install
```

### Issue: "Invalid API key" when deploying

**Solution:**
- Check your `.env` file
- Make sure `SEPOLIA_RPC_URL` has your correct Infura/Alchemy key
- No spaces around the `=` sign

### Issue: "Insufficient funds" error

**Solution:**
- Get more Sepolia ETH from faucet
- Make sure you're on Sepolia network in MetaMask

### Issue: MetaMask not connecting

**Solution:**
- Refresh the page
- Make sure you're on Sepolia network
- Try disconnecting and reconnecting in MetaMask settings

### Issue: Contract not deploying

**Solution:**
- Check your private key in `.env` (no 0x prefix)
- Make sure you have Sepolia ETH
- Try deploying to localhost first:
  ```powershell
  # Terminal 1
  npx hardhat node
  
  # Terminal 2
  npx hardhat run scripts/deploy.js --network localhost
  ```

### Issue: Frontend shows old contract address

**Solution:**
- Re-run the deployment script
- It will automatically update `frontend/src/services/contractAddress.json`
- Restart the frontend server

---

## 📦 Project Structure Reference

```
c:\Users\adhem\OneDrive\Bureau\Course\blockchain\projet\
│
├── .env                          ← YOUR API KEYS GO HERE!
├── .env.example                  ← Template for .env
├── hardhat.config.js             ← Hardhat configuration
├── package.json                  ← Project dependencies
│
├── contracts/
│   └── DonationPlatform.sol      ← Main smart contract
│
├── scripts/
│   └── deploy.js                 ← Deployment script
│
├── test/
│   └── DonationPlatform.test.js  ← Test suite
│
└── frontend/
    ├── package.json              ← Frontend dependencies
    │
    └── src/
        ├── services/
        │   ├── web3Service.js           ← Web3 functions
        │   ├── contractABI.json         ← Auto-generated by deploy
        │   └── contractAddress.json     ← Auto-generated by deploy
        │
        ├── components/              ← React components
        ├── App.jsx                  ← Main app
        └── index.js                 ← Entry point
```

---

## 🎓 Learning Resources

- **Solidity:** https://docs.soliditylang.org/
- **Hardhat:** https://hardhat.org/docs
- **Ethers.js:** https://docs.ethers.org/
- **React:** https://react.dev/
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## ✅ Checklist Summary

- [ ] Node.js installed
- [ ] MetaMask installed and configured
- [ ] Got Infura/Alchemy API key
- [ ] Got Sepolia ETH from faucet
- [ ] Created `.env` file with all keys
- [ ] Ran `npm install` in root
- [ ] Ran `npm install` in frontend
- [ ] Compiled contract successfully
- [ ] All tests passed
- [ ] Deployed to Sepolia
- [ ] Frontend running on localhost:3000
- [ ] Connected MetaMask to app
- [ ] Created test campaign
- [ ] Made test donation

---

**🎉 If you've completed all steps, congratulations! Your blockchain donation platform is live!**

**Need help?** Re-read the troubleshooting section or check the main README.md
