import React, { useState, useEffect } from "react";
import { getAllCampaigns, getCampaignStatus, getDaysRemaining } from "../services/web3Service";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CampaignList = () => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        try {
            setLoading(true);
            const allCampaigns = await getAllCampaigns();
            setCampaigns(allCampaigns);
        } catch (error) {
            console.error("Error loading campaigns:", error);
            toast.error("Failed to load campaigns");
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

    const getStatusIcon = (status) => {
        switch (status) {
            case "Open":
                return "🟢";
            case "Funded":
                return "✅";
            case "Paused":
                return "⏸️";
            case "Expired":
                return "⏰";
            default:
                return "⚪";
        }
    };

    const filteredCampaigns = campaigns.filter((campaign) => {
        const status = getCampaignStatus(campaign);
        if (filter === "all") return true;
        return status.toLowerCase() === filter.toLowerCase();
    });

    const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
        switch (sortBy) {
            case "newest":
                return b.id - a.id;
            case "oldest":
                return a.id - b.id;
            case "mostFunded":
                return parseFloat(b.collectedAmount) - parseFloat(a.collectedAmount);
            case "deadline":
                return a.deadline - b.deadline;
            default:
                return 0;
        }
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading campaigns...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <span className="text-4xl">💎</span>
                    All Campaigns
                </h1>
                <button
                    onClick={loadCampaigns}
                    className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg p-4 shadow-md flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Filter:</span>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="all">All</option>
                        <option value="open">Open</option>
                        <option value="funded">Funded</option>
                        <option value="paused">Paused</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="mostFunded">Most Funded</option>
                        <option value="deadline">Deadline (Soon)</option>
                    </select>
                </div>

                <div className="ml-auto text-sm text-gray-600">
                    Showing <span className="font-bold">{sortedCampaigns.length}</span> campaigns
                </div>
            </div>

            {/* Campaigns Grid */}
            {sortedCampaigns.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg mb-4">No campaigns found</p>
                    <button
                        onClick={() => navigate("/create")}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
                    >
                        Create First Campaign
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedCampaigns.map((campaign) => {
                        const status = getCampaignStatus(campaign);
                        const progress = getProgressPercentage(campaign.collectedAmount, campaign.goalAmount);
                        const daysLeft = getDaysRemaining(campaign.deadline);

                        return (
                            <div
                                key={campaign.id}
                                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 cursor-pointer transform hover:-translate-y-1"
                                onClick={() => navigate(`/campaign/${campaign.id}`)}
                            >
                                {/* Status Badge */}
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status)}`}>
                                            {getStatusIcon(status)} {status}
                                        </span>
                                        <span className="text-xs font-semibold text-gray-600">
                                            #{campaign.id}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-2">
                                        {campaign.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {campaign.description}
                                    </p>
                                </div>

                                {/* Campaign Details */}
                                <div className="p-4 space-y-3">
                                    {/* Progress */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-semibold text-gray-700">Progress</span>
                                            <span className="text-gray-600">{progress.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Amounts */}
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-gray-500">Collected</p>
                                            <p className="text-lg font-bold text-blue-600">
                                                {parseFloat(campaign.collectedAmount).toFixed(2)} ETH
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Goal</p>
                                            <p className="text-lg font-bold text-gray-800">
                                                {parseFloat(campaign.goalAmount).toFixed(2)} ETH
                                            </p>
                                        </div>
                                    </div>

                                    {/* Deadline */}
                                    <div className="flex items-center gap-2 text-sm pt-2 border-t border-gray-200">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-gray-700 font-medium">
                                            {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
                                        </span>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/campaign/${campaign.id}`);
                                        }}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 mt-2"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CampaignList;
