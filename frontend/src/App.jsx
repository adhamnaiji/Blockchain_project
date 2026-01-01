import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ConnectWallet from "./components/ConnectWallet";
import CampaignList from "./components/CampaignList";
import CampaignForm from "./components/CampaignForm";
import CampaignDetail from "./components/CampaignDetail";
import DonationHistory from "./components/DonationHistory";
import CreatorDashboard from "./components/CreatorDashboard";

import "./styles/App.css";

function Navigation({ currentAccount, setCurrentAccount }) {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="text-4xl group-hover:scale-110 transition-transform">💎</div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">DonationChain</h1>
                            <p className="text-xs text-blue-100">Decentralized Funding Platform</p>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-2">
                        <Link
                            to="/"
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${isActive("/")
                                ? "bg-white text-blue-600"
                                : "text-white hover:bg-white/20"
                                }`}
                        >
                            🏠 Campaigns
                        </Link>
                        <Link
                            to="/create"
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${isActive("/create")
                                ? "bg-white text-blue-600"
                                : "text-white hover:bg-white/20"
                                }`}
                        >
                            ✨ Create
                        </Link>
                        <Link
                            to="/dashboard"
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${isActive("/dashboard")
                                ? "bg-white text-blue-600"
                                : "text-white hover:bg-white/20"
                                }`}
                        >
                            👤 Dashboard
                        </Link>
                        <Link
                            to="/history"
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${isActive("/history")
                                ? "bg-white text-blue-600"
                                : "text-white hover:bg-white/20"
                                }`}
                        >
                            📜 History
                        </Link>
                    </div>

                    {/* Wallet Connection */}
                    <div>
                        <ConnectWallet onAccountChange={setCurrentAccount} />
                    </div>
                </div>
            </div>
        </nav>
    );
}

function App() {
    const [currentAccount, setCurrentAccount] = useState(null);

    return (
        <Router>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
                <Navigation currentAccount={currentAccount} setCurrentAccount={setCurrentAccount} />

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>
                        <Route path="/" element={<CampaignList />} />
                        <Route path="/create" element={<CampaignForm currentAccount={currentAccount} />} />
                        <Route path="/campaign/:id" element={<CampaignDetail currentAccount={currentAccount} />} />
                        <Route path="/dashboard" element={<CreatorDashboard currentAccount={currentAccount} />} />
                        <Route path="/history" element={<DonationHistory />} />
                    </Routes>
                </main>

                {/* Footer */}
                <footer className="bg-gray-800 text-white mt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                                    <span className="text-2xl">💎</span>
                                    DonationChain
                                </h3>
                                <p className="text-gray-300 text-sm">
                                    A transparent, decentralized platform for crowdfunding campaigns on the Ethereum blockchain.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-3">Quick Links</h4>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li><Link to="/" className="hover:text-white transition-colors">All Campaigns</Link></li>
                                    <li><Link to="/create" className="hover:text-white transition-colors">Create Campaign</Link></li>
                                    <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                                    <li><Link to="/history" className="hover:text-white transition-colors">Donation History</Link></li>
                                </ul>
                            </div>

                        </div>

                    </div>
                </footer>

                {/* Toast Notifications */}
                <ToastContainer
                    position="bottom-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
            </div>
        </Router>
    );
}

export default App;
