# 🧪 Full Local Testing Guide

Follow these steps to test every feature of your DonationChain platform locally.

---

## 🏗️ Phase 1: Environment Setup (Do this first)

You need **3 separate terminals** (Command Prompt or PowerShell) running at the same time.

### Terminal 1: The Blockchain 🧱
Start the local blockchain. **Keep this running!**
```powershell
cd c:\Users\adhem\OneDrive\Bureau\Course\blockchain\projet
npx hardhat node
```
*You will see a list of 20 accounts with 10,000 ETH each. Scroll to the top and find Account #0's Private Key.*

### Terminal 2: The Contract 📜
Deploy your smart contract to the local blockchain.
```powershell
cd c:\Users\adhem\OneDrive\Bureau\Course\blockchain\projet
npx hardhat run scripts/deploy.js --network localhost
```
*Wait for output: "DonationPlatform deployed to: 0x..."*

### Terminal 3: The Website 💻
Start the React frontend.
```powershell
cd c:\Users\adhem\OneDrive\Bureau\Course\blockchain\projet\frontend
npm start
```
*Your browser should open http://localhost:3000*

---

## 🦊 Phase 2: Configure MetaMask

**1. Add Local Network**
* Open MetaMask → Click Network Dropdown (top left) → "Add network" → "Add a network manually".
* **Network Name**: Localhost 8545
* **RPC URL**: `http://127.0.0.1:8545`
* **Chain ID**: `1337`
* **Currency Symbol**: `ETH`
* Click **Save**.

**2. Import Test Account (The Rich Account)**
* Go back to **Terminal 1**.
* Copy the **Private Key** for **Account #0** (it starts with `0x...` and is below the address).
* In MetaMask: Click Account Icon (top right) → "Import account" → "Private key".
* Paste the key and click **Import**.
* *Result: You should see generic "Account 1" (or similar) with **10,000 ETH**.*

---

## 🎭 Phase 3: Test Scenarios

### Scenario A: Creator Flow (Creating a Campaign) 🆕
1.  **Connect**: Click **"Connect Wallet"** in the top right. Select the account with 10,000 ETH.
2.  **Navigate**: Click **"✨ Create"** in the menu.
3.  **Fill Form**:
    *   **Title**: `Save the Pandas`
    *   **Description**: `Raising funds to protect bamboo forests.`
    *   **Goal Amount**: `5` (ETH)
    *   **Duration**: `30` (Days)
4.  **Action**: Click **"Create Campaign"**.
5.  **MetaMask**: A popup will appear. Click **"Confirm"**.
6.  **Verify**: You should be redirected to the Home page. Your "Save the Pandas" campaign should appear in the list!

### Scenario B: Donor Flow (Making a Donation) 💰
*Ideally, try this with a **different** account to simulate a real user (Import Account #1 from Terminal 1 using its private key), but using the same account works too.*

1.  **Navigate**: Go to **"🏠 Campaigns"**.
2.  **Select**: Click **"View Details"** on "Save the Pandas".
3.  **Donate**:
    *   Find the "Make a Donation" box.
    *   Enter Amount: `0.6` ETH.
    *   *Notice: The badge should change to "Silver" (0.5+ ETH).*
4.  **Action**: Click **"Donate Now"**.
5.  **MetaMask**: Click **"Confirm"**.
6.  **Verify**:
    *   The progress bar should update (0.6 / 5 ETH).
    *   The "Recent Donations" list below should show your donation.

### Scenario C: Dashboard & History 📊
1.  **Dashboard**: Click **"👤 Dashboard"**.
    *   You should see your created campaign ("Save the Pandas").
    *   Total Collected should match the donation amount.
2.  **History**: Click **"📜 History"**.
    *   You should see the record of your 0.6 ETH donation with the "Silver" reward level.

### Scenario D: Withdrawal (Advanced) 🏦
*To test withdrawal, the goal must be reached.*

1.  **Go back to "Save the Pandas"**.
2.  **Donate again**: Enter `4.5` ETH (Goal was 5, we already have 0.6, so 4.5 will take us to 5.1).
3.  **Confirm transaction**.
4.  **Refresh page**. The status badge should say **"Funded"** (Green).
5.  **Withdraw**:
    *   Since you are the creator (Account #0), you will see a **"Withdraw Funds"** button in the "Creator Actions" section.
    *   Click it and confirm.
    *   *Result: The ETH from the contract is sent to your wallet.*

---

## 🧹 How to Reset Everything

If you want to start fresh (delete all campaigns):
1.  **Stop Terminal 1** (Click in terminal, press `Ctrl + C`).
2.  **Run `npx hardhat node` again** (This clears the local blockchain data).
3.  **Re-deploy**: Run `npx hardhat run scripts/deploy.js --network localhost` in Terminal 2.
4.  **Reset MetaMask**:
    *   Click Account Icon → Settings → Advanced → **Clear activity and nonce data**. (This fixes "Nonce too high" errors when resetting localchains).

Happy Testing! 🚀
