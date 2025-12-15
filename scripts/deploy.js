const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Deploying DonationPlatform contract...\n");

    // Get the contract factory
    const DonationPlatform = await hre.ethers.getContractFactory("DonationPlatform");

    // Deploy the contract
    console.log("⏳ Deployment in progress...");
    const donationPlatform = await DonationPlatform.deploy();

    await donationPlatform.waitForDeployment();
    const contractAddress = await donationPlatform.getAddress();

    console.log("✅ DonationPlatform deployed to:", contractAddress);

    // Get network information
    const network = await hre.ethers.provider.getNetwork();
    console.log("📡 Network:", network.name, "(chainId:", network.chainId, ")");

    // Get deployer information
    const [deployer] = await hre.ethers.getSigners();
    console.log("👤 Deployed by:", deployer.address);
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Deployer balance:", hre.ethers.formatEther(balance), "ETH\n");

    // Save contract address and ABI to frontend
    const contractsDir = path.join(__dirname, "..", "frontend", "src", "services");

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
    }

    // Save contract address
    fs.writeFileSync(
        path.join(contractsDir, "contractAddress.json"),
        JSON.stringify({
            DonationPlatform: contractAddress,
            network: network.name,
            chainId: Number(network.chainId)
        }, null, 2)
    );

    // Save ABI
    const artifact = await hre.artifacts.readArtifact("DonationPlatform");
    fs.writeFileSync(
        path.join(contractsDir, "contractABI.json"),
        JSON.stringify(artifact.abi, null, 2)
    );

    console.log("💾 Contract address and ABI saved to frontend/src/services/");
    console.log("\n📋 Next steps:");
    console.log("1. Copy the contract address:", contractAddress);
    console.log("2. Verify on Etherscan (if on testnet):");
    console.log(`   npx hardhat verify --network ${network.name} ${contractAddress}`);
    console.log("3. Navigate to frontend and run: npm install && npm start");
    console.log("\n✨ Deployment complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
