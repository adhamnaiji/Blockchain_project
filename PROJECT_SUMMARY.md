# Project Summary

## Overview
This project is a decentralized donation platform ("DonationChain") built on the Ethereum blockchain. It allows users to create campaigns, donate ETH, and track their contributions.

## Recent Updates
We have enhanced the application with the following features:
1.  **PostgreSQL Persistence**: Campaigns and donation history are now saved in a local PostgreSQL database (`init-db.js`). This ensures data is not lost when the browser session ends or if blockchain query limits are hit.
    - **Campaigns**: Saved immediately after creation.
    - **Donations**: Recorded immediately after a successful transaction.
2.  **Hybrid Architecture**: The frontend now fetches data primarily from the backend for speed and reliability, falling back to the blockchain if necessary.
3.  **New Smart Contracts**: Added two new contracts for future extensibility:
    - `DonorBadge.sol` (ERC721): A non-fungible token to reward top donors.
    - `PlatformToken.sol` (ERC20): A utility token for the platform.

## Technologies Used
- **Frontend**: React, Vite, TailwindCSS, Ethers.js
- **Backend**: Node.js, Express, PostgreSQL
- **Blockchain**: Solidity, Hardhat, Ethereum (Sepolia Testnet)
- **Database**: PostgreSQL

## Smart Contracts
1.  **DonationPlatform.sol**: Core logic for campaigns and donations.
2.  **DonorBadge.sol**: NFT contract for donor recognition.
3.  **PlatformToken.sol**: Token contract for governance or rewards.
