import React, { useState, useEffect } from "react";
import { getAllCampaigns, getCampaignStatus, getDaysRemaining, getCampaignDonations } from "../services/web3Service";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CreatorDashboard = ({ currentAccount }) => {
    const navigate = useNavigate();
    const [myCampaigns, setMyCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCampaigns: 0,
        totalCollected: 0,
        uniqueDonors: new Set(),
    });

    useEffect(() => {
        if (currentAccount) {
            loadMyCampaigns();
        } else {
            setLoading(false);
        }
    }, [currentAccount]);

    const loadMyCampaigns = async () => {
        try {
            setLoading(true);
            const allCampaigns = await getAllCampaigns();
            const creatorCampaigns = allCampaigns.filter(
                (c) => c.creator.toLowerCase() === currentAccount.toLowerCase()
            );

            // Calculate statistics
            let totalCollected = 0;
            const uniqueDonors = new Set();

            for (const campaign of creatorCampaigns) {
                totalCollected += parseFloat(campaign.collectedAmount);
                const donations = await getCampaignDonations(campaign.id);
                donations.forEach((d) => uniqueDonors.add(d.donor.toLowerCase()));
            }

            setMyCampaigns(creatorCampaigns);
            setStats({
                totalCampaigns: creatorCampaigns.length,
                totalCollected,
                uniqueDonors,
            });
        } catch (error) {
            console.error("Error loading campaigns:", error);
            toast.error("Failed to load your campaigns");
        } finally {
            setLoading(false);
        }
    };

    const getProgressPercentage = (collected, goal) => {
        const percentage = (parseFloat(collected) / parseFloat(goal)) * 100;
        return Math.min(percentage, 100);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Open":
                return "bg-green-100 text-green-800 border-green-200";
            case "Funded":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "Paused":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "Expired":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    if (!currentAccount) {
        return (
            <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
                <p className="text-xl text-gray-600 mb-4">Please connect your wallet to view your dashboard</p>
                <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <span className="text-4xl">👤</span>
                    Creator Dashboard
                </h1>
                <button
                    onClick={() => navigate("/create")}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Campaign
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-purple-700 font-medium">Total Campaigns</p>
                        <span className="text-3xl">📊</span>
                    </div>
                    <p className="text-4xl font-bold text-purple-900">{stats.totalCampaigns}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-green-700 font-medium">Total Collected</p>
                        <span className="text-3xl">💰</span>
                    </div>
                    <p className="text-4xl font-bold text-green-900">{stats.totalCollected.toFixed(4)} ETH</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-blue-700 font-medium">Unique Donors</p>
                        <span className="text-3xl">👥</span>
                    </div>
                    <p className="text-4xl font-bold text-blue-900">{stats.uniqueDonors.size}</p>
                </div>
            </div>

            {/* Campaigns List */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Campaigns</h2>

                {myCampaigns.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-lg mb-4">You haven't created any campaigns yet</p>
                        <button
                            onClick={() => navigate("/create")}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
                        >
                            Create Your First Campaign
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myCampaigns.map((campaign) => {
                            const status = getCampaignStatus(campaign);
                            const progress = getProgressPercentage(campaign.collectedAmount, campaign.goalAmount);
                            const daysLeft = getDaysRemaining(campaign.deadline);

                            return (
                                <div
                                    key={campaign.id}
                                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
                                    onClick={() => navigate(`/campaign/${campaign.id}`)}
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-1">{campaign.title}</h3>
                                            <p className="text-sm text-gray-600">Campaign #{campaign.id}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status)}`}>
                                            {status}
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-700">Progress</span>
                                            <span className="text-gray-600">{progress.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Collected</p>
                                            <p className="text-lg font-bold text-blue-600">
                                                {parseFloat(campaign.collectedAmount).toFixed(2)} ETH
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Goal</p>
                                            <p className="text-lg font-bold text-gray-800">
                                                {parseFloat(campaign.goalAmount).toFixed(2)} ETH
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Time Left</p>
                                            <p className="text-lg font-bold text-gray-800">
                                                {daysLeft > 0 ? `${daysLeft} days` : "Expired"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/campaign/${campaign.id}`);
                                            }}
                                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all text-sm"
                                        >
                                            View Details
                                        </button>
                                        {status === "Open" && (
                                            <button
                                                className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold hover:bg-yellow-200 transition-all text-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/campaign/${campaign.id}`);
                                                }}
                                            >
                                                Manage
                                            </button>
                                        )}
                                        {parseFloat(campaign.collectedAmount) >= parseFloat(campaign.goalAmount) && !campaign.isFunded && (
                                            <button
                                                className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold hover:bg-green-200 transition-all text-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/campaign/${campaign.id}`);
                                                }}
                                            >
                                                Withdraw
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatorDashboard;
