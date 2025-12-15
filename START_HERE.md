# 📚 Complete Documentation Index

## 🎯 Start Here - Choose Your Path

### 🏃 I want to start NOW (5 minutes)
➡️ **[QUICKSTART.md](QUICKSTART.md)**
- Copy-paste commands
- Get running immediately
- Local or Sepolia options

### 📖 I want detailed step-by-step instructions
➡️ **[SETUP_GUIDE.md](SETUP_GUIDE.md)**
- Where to get API keys
- Exact locations for everything
- Troubleshooting section
- Complete checklist

### 🗺️ I want to understand the project visually
➡️ **[VISUAL_GUIDE.md](VISUAL_GUIDE.md)**
- Flowcharts and diagrams
- File structure explained
- Component interactions
- Campaign lifecycle

### 📘 I want full technical documentation
➡️ **[README.md](README.md)**
- Project architecture
- Smart contract details
- Security features
- Complete API reference

---

## 📋 Quick Actions

| I Want To... | Command | Where |
|-------------|---------|-------|
| **Install everything** | `npm install && cd frontend && npm install` | Project root |
| **Test the contract** | `npx hardhat test` | Project root |
| **Deploy locally** | `npx hardhat run scripts/deploy.js --network localhost` | Project root |
| **Deploy to Sepolia** | `npx hardhat run scripts/deploy.js --network sepolia` | Project root |
| **Start frontend** | `npm start` | frontend/ folder |
| **Run all tests** | `npx hardhat test` | Project root |

---

## 🔑 Where to Add Your Keys

### Create `.env` file in project root:

```env
# Get from: https://infura.io/ or https://alchemy.com/
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Get from: MetaMask → Account Details → Show Private Key
PRIVATE_KEY=your_private_key_without_0x

# Get from: https://etherscan.io/myapikey (optional)
ETHERSCAN_API_KEY=your_etherscan_api_key

# Leave as false
REPORT_GAS=false
```

**File location:** `c:\Users\adhem\OneDrive\Bureau\Course\blockchain\projet\.env`

---

## 🚀 Two Ways to Run

### Option A: Local Testing (Fastest)

```powershell
# Terminal 1: Start local blockchain
npx hardhat node

# Terminal 2: Deploy contract
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Start frontend
cd frontend
npm start
```

**MetaMask Setup:**
- Network: Localhost 8545
- Chain ID: 1337
- Import test account from hardhat node

### Option B: Sepolia Testnet (Production-like)

```powershell
# 1. Get Sepolia ETH from faucet
# https://sepoliafaucet.com/

# 2. Create .env with your keys
# See "Where to Add Your Keys" above

# 3. Deploy
npx hardhat run scripts/deploy.js --network sepolia

# 4. Start frontend
cd frontend
npm start
```

**MetaMask Setup:**
- Network: Sepolia
- Get test ETH from faucet

---

## 📁 Project Files Overview

```
YOUR PROJECT LOCATION:
c:\Users\adhem\OneDrive\Bureau\Course\blockchain\projet\

KEY FILES:
├── .env                    ← CREATE THIS! Your API keys go here
├── QUICKSTART.md           ← Fast commands
├── SETUP_GUIDE.md          ← Detailed steps
├── VISUAL_GUIDE.md         ← Diagrams & visuals
├── README.md               ← Full documentation
│
├── contracts/
│   └── DonationPlatform.sol     ← Smart contract
│
├── scripts/
│   └── deploy.js                ← Deployment script
│
├── test/
│   └── DonationPlatform.test.js ← Test suite
│
└── frontend/
    ├── src/
    │   ├── components/          ← React UI
    │   ├── services/
    │   │   ├── web3Service.js   ← Blockchain functions
    │   │   ├── contractABI.json ← Auto-created
    │   │   └── contractAddress.json ← Auto-created
    │   └── App.jsx
    └── package.json
```

---

## 🎓 Learning Order

1. **Read** [QUICKSTART.md](QUICKSTART.md) - Get oriented
2. **Follow** [SETUP_GUIDE.md](SETUP_GUIDE.md) - Do the setup
3. **Test** the smart contract - `npx hardhat test`
4. **Deploy** locally first - Practice without cost
5. **Deploy** to Sepolia - Real blockchain
6. **Explore** [README.md](README.md) - Understand deeply
7. **Reference** [VISUAL_GUIDE.md](VISUAL_GUIDE.md) - See the flow

---

## ✅ Success Checklist

### Initial Setup
- [ ] Node.js installed (v16+)
- [ ] Project folder opened in terminal
- [ ] Ran `npm install` in root
- [ ] Ran `npm install` in frontend

### Configuration
- [ ] Created `.env` file in project root
- [ ] Added Infura/Alchemy API key to `.env`
- [ ] Added MetaMask private key to `.env`
- [ ] Got Sepolia ETH from faucet (if using Sepolia)

### Testing
- [ ] Compiled contract: `npx hardhat compile`
- [ ] All tests pass: `npx hardhat test`
- [ ] Deployed successfully (local or Sepolia)
- [ ] Contract address saved to frontend/src/services/

### Frontend
- [ ] Frontend starts without errors: `npm start`
- [ ] Opens at http://localhost:3000
- [ ] MetaMask connects successfully
- [ ] Can see campaign list

### First Actions
- [ ] Created first campaign
- [ ] Made first donation
- [ ] Checked dashboard
- [ ] Viewed donation history

---

## 🆘 Common Issues

| Problem | Quick Fix |
|---------|-----------|
| Module not found | `npm install` |
| Can't connect MetaMask | Switch to correct network (Sepolia or Localhost) |
| Insufficient funds | Get Sepolia ETH or use local network |
| Invalid API key | Check `.env` file format (no spaces!) |
| Contract not found | Re-run deployment script |
| Old data showing | Refresh browser, restart frontend |

**Detailed troubleshooting:** See [SETUP_GUIDE.md](SETUP_GUIDE.md#troubleshooting)

---

## 🔗 External Resources

### Get API Keys & Test ETH
- **Infura:** https://infura.io/ (API keys)
- **Alchemy:** https://alchemy.com/ (Alternative to Infura)
- **Sepolia Faucet:** https://sepoliafaucet.com/ (Test ETH)
- **Etherscan:** https://etherscan.io/myapikey (Verification)

### Documentation
- **Hardhat Docs:** https://hardhat.org/docs
- **Ethers.js Docs:** https://docs.ethers.org/
- **Solidity Docs:** https://docs.soliditylang.org/
- **React Docs:** https://react.dev/

### Blockchain Explorers
- **Sepolia Etherscan:** https://sepolia.etherscan.io/
- **MetaMask:** https://metamask.io/

---

## 💡 Pro Tips

1. **Start with local testing** - It's faster and free
2. **Keep terminals open** - You need multiple terminals running
3. **Save your contract address** - You'll need it later
4. **Test before Sepolia** - Don't waste test ETH on bugs
5. **Use test accounts only** - Never use real money keys
6. **Read error messages** - They usually tell you what's wrong

---

## 📞 Need More Help?

1. 📖 Check the appropriate guide:
   - Quick commands → [QUICKSTART.md](QUICKSTART.md)
   - Step-by-step → [SETUP_GUIDE.md](SETUP_GUIDE.md)
   - Understanding → [VISUAL_GUIDE.md](VISUAL_GUIDE.md)
   - Technical → [README.md](README.md)

2. 🔍 Look for your error message in [SETUP_GUIDE.md](SETUP_GUIDE.md#troubleshooting)

3. 🔄 Try restarting from scratch:
   ```powershell
   # Clean install
   rm -r node_modules
   npm install
   ```

---

## 🎉 You're Ready!

**Your next step:** Choose your path at the top of this file

- Fast start? → [QUICKSTART.md](QUICKSTART.md)  
- Detailed setup? → [SETUP_GUIDE.md](SETUP_GUIDE.md)
- Visual learner? → [VISUAL_GUIDE.md](VISUAL_GUIDE.md)

**Good luck with your blockchain project!** 🚀
