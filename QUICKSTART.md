# ⚡ Quick Start - 5 Minutes

## 🎯 Fastest Way to Run the Project

### Option 1: Test Locally (Recommended for First Time)

```powershell
# 1️⃣ Install dependencies
cd c:\Users\adhem\OneDrive\Bureau\Course\blockchain\projet
npm install
cd frontend
npm install
cd ..

# 2️⃣ Start local blockchain
npx hardhat node
# ⚠️ KEEP THIS TERMINAL OPEN!

# 3️⃣ In NEW terminal, deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# 4️⃣ In NEW terminal, start frontend
cd frontend
npm start

# 5️⃣ Configure MetaMask
# - Network: Localhost 8545
# - Chain ID: 1337
# - Import one of the test accounts from hardhat node output
```

**✅ Done! Open http://localhost:3000**

---

### Option 2: Deploy to Sepolia Testnet (Production-like)

```powershell
# 1️⃣ Get requirements
# - Infura key: https://infura.io/
# - Sepolia ETH: https://sepoliafaucet.com/
# - MetaMask private key

# 2️⃣ Create .env file
New-Item -Path .env -ItemType File

# 3️⃣ Add to .env:
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_private_key_without_0x

# 4️⃣ Install & test
npm install
npx hardhat test

# 5️⃣ Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# 6️⃣ Start frontend
cd frontend
npm install
npm start

# 7️⃣ Connect MetaMask (Sepolia network)
```

**✅ Done! Open http://localhost:3000**

---

## 🎨 What You'll See

```
┌─────────────────────────────────────────────┐
│  💎 DonationChain             [Connect Wallet] │
├─────────────────────────────────────────────┤
│                                             │
│  🏠 Campaigns  ✨ Create  👤 Dashboard  📜 History │
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ Campaign #1  │  │ Campaign #2  │       │
│  │ 🟢 Open      │  │ ✅ Funded    │       │
│  │ 5.2 / 10 ETH │  │ 12 / 10 ETH  │       │
│  │ ████████░░   │  │ ██████████   │       │
│  │ 15 days left │  │ Goal reached │       │
│  └──────────────┘  └──────────────┘       │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📍 Key Files You Need to Know

```
WHERE TO ADD THINGS:

1. API Keys & Private Key
   📁 .env (create this file!)
   
2. Contract Code
   📁 contracts/DonationPlatform.sol
   
3. Frontend Components
   📁 frontend/src/components/
   
4. Web3 Integration
   📁 frontend/src/services/web3Service.js
```

---

## 🔑 Where to Get Keys

| What | Where | Takes |
|------|-------|-------|
| **Infura API Key** | https://infura.io/ | 2 min |
| **Sepolia ETH** | https://sepoliafaucet.com/ | 2 min |
| **MetaMask Private Key** | MetaMask → Account Details → Show Private Key | 1 min |
| **Etherscan API** (optional) | https://etherscan.io/myapikey | 3 min |

---

## 🧪 Test Commands

```powershell
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/DonationPlatform.test.js

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Check test coverage
npx hardhat coverage
```

---

## 🚨 Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| ❌ "Module not found" | Run `npm install` |
| ❌ "Invalid API key" | Check `.env` file format |
| ❌ "Insufficient funds" | Get Sepolia ETH from faucet |
| ❌ MetaMask won't connect | Switch to Sepolia network |
| ❌ Old contract address | Re-run deployment script |

---

## 🎮 First Actions to Try

1. **Connect Wallet** → Click "Connect Wallet" button
2. **Create Campaign** → Go to "Create" tab
3. **Make Donation** → Open a campaign, donate 0.1 ETH
4. **Check Dashboard** → View your statistics
5. **View Etherscan** → Click any transaction link

---

## 💡 Pro Tips

✅ **Use localhost first** - Faster, free, easier to debug
✅ **Keep terminal open** - Don't close the hardhat node
✅ **Copy contract address** - You might need it
✅ **Test on Sepolia** - Before showing anyone
✅ **Never share private key** - Use test accounts only

---

## 🆘 Need Help?

1. Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed steps
2. Check [README.md](README.md) for full documentation
3. Look at error messages carefully
4. Re-run `npm install` if weird errors

---

**Ready to start? Choose Option 1 (Local) or Option 2 (Sepolia) above!** 🚀
