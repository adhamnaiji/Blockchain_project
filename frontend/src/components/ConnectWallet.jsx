import React, { useState, useEffect } from "react";
import { connectWallet, getCurrentAccount, getBalance, formatAddress } from "../services/web3Service";
import { toast } from "react-toastify";

const ConnectWallet = ({ onAccountChange }) => {
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState("0");
    const [isConnecting, setIsConnecting] = useState(false);
    const [isWrongNetwork, setIsWrongNetwork] = useState(false);

    const REQUIRED_CHAIN_ID = 1337; // Localhost
    useEffect(() => {
        // Check if already connected
        checkConnection();

        // Listen for account changes
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", handleAccountsChanged);
            window.ethereum.on("chainChanged", handleChainChanged);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
                window.ethereum.removeListener("chainChanged", handleChainChanged);
            }
        };
    }, []);

    const checkConnection = async () => {
        try {
            const currentAccount = await getCurrentAccount();
            if (currentAccount) {
                setAccount(currentAccount);
                const bal = await getBalance(currentAccount);
                setBalance(bal);

                // Check Chain ID
                const chainId = await window.ethereum.request({ method: "eth_chainId" });
                if (parseInt(chainId, 16) !== 1337) {
                    setIsWrongNetwork(true);
                } else {
                    setIsWrongNetwork(false);
                }

                if (onAccountChange) onAccountChange(currentAccount);
            }
        } catch (error) {
            console.error("Error checking connection:", error);
        }
    };

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            const connectedAccount = await connectWallet();
            setAccount(connectedAccount);
            const bal = await getBalance(connectedAccount);
            setBalance(bal);
            if (onAccountChange) onAccountChange(connectedAccount);
            toast.success("Wallet connected successfully!");
        } catch (error) {
            console.error("Error connecting wallet:", error);
            toast.error(error.message || "Failed to connect wallet");
        } finally {
            setIsConnecting(false);
        }
    };

    const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
            setAccount(null);
            setBalance("0");
            if (onAccountChange) onAccountChange(null);
            toast.info("Wallet disconnected");
        } else {
            setAccount(accounts[0]);
            const bal = await getBalance(accounts[0]);
            setBalance(bal);
            if (onAccountChange) onAccountChange(accounts[0]);
            toast.info("Account changed");
        }
    };

    const handleChainChanged = () => {
        window.location.reload();
    };

    if (!window.ethereum) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">⚠️ MetaMask is not installed</p>
                <p className="text-red-600 text-sm mt-1">
                    Please install MetaMask to use this application.
                </p>
                <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                >
                    Download MetaMask
                </a>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            {account ? (
                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-lg border border-blue-200">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-600 font-medium">Connected</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-800">{formatAddress(account)}</span>
                            <button
                                onClick={async () => {
                                    try {
                                        await window.ethereum.request({
                                            method: "wallet_requestPermissions",
                                            params: [{ eth_accounts: {} }]
                                        });
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }}
                                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-0.5 rounded transition-colors"
                                title="Switch Account"
                            >
                                🔄 Switch
                            </button>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-gray-300"></div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-600 font-medium">Balance</span>
                        <span className="text-sm font-bold text-gray-800">
                            {parseFloat(balance).toFixed(4)} ETH
                        </span>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
            ) : (
                <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isConnecting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Connecting...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Connect Wallet
                        </>
                    )}
                </button>
            )}
        </div>
    );
};

export default ConnectWallet;
