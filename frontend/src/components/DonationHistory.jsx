import React, { useState, useEffect } from "react";
import { getAllCampaigns, getCampaignDonations, formatAddress, formatDate, getRewardLevelName, getEtherscanUrl } from "../services/web3Service";
import { toast } from "react-toastify";

const DonationHistory = () => {
    const [allDonations, setAllDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCampaign, setFilterCampaign] = useState("all");
    const [filterDonor, setFilterDonor] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    useEffect(() => {
        loadAllDonations();
    }, []);

    const loadAllDonations = async () => {
        try {
            setLoading(true);
            const campaigns = await getAllCampaigns();
            const donations = [];

            for (const campaign of campaigns) {
                const campaignDonations = await getCampaignDonations(campaign.id);
                campaignDonations.forEach((donation) => {
                    donations.push({
                        ...donation,
                        campaignId: campaign.id,
                        campaignTitle: campaign.title,
                    });
                });
            }

            setAllDonations(donations);
        } catch (error) {
            console.error("Error loading donations:", error);
            toast.error("Failed to load donation history");
        } finally {
            setLoading(false);
        }
    };

    const getRewardBadgeColor = (level) => {
        switch (Number(level)) {
            case 3:
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case 2:
                return "bg-gray-100 text-gray-800 border-gray-300";
            case 1:
                return "bg-orange-100 text-orange-800 border-orange-300";
            default:
                return "bg-gray-50 text-gray-600 border-gray-200";
        }
    };

    const getRewardIcon = (level) => {
        switch (Number(level)) {
            case 3:
                return "🥇";
            case 2:
                return "🥈";
            case 1:
                return "🥉";
            default:
                return "⚪";
        }
    };

    // Filtering
    const filteredDonations = allDonations.filter((donation) => {
        const campaignMatch = filterCampaign === "all" || donation.campaignId.toString() === filterCampaign;
        const donorMatch = !filterDonor || donation.donor.toLowerCase().includes(filterDonor.toLowerCase());
        return campaignMatch && donorMatch;
    });

    // Sorting
    const sortedDonations = [...filteredDonations].sort((a, b) => {
        switch (sortBy) {
            case "newest":
                return b.timestamp - a.timestamp;
            case "oldest":
                return a.timestamp - b.timestamp;
            case "highest":
                return parseFloat(b.amount) - parseFloat(a.amount);
            case "lowest":
                return parseFloat(a.amount) - parseFloat(b.amount);
            default:
                return 0;
        }
    });

    const totalDonations = sortedDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading donation history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <span className="text-4xl">📜</span>
                    Donation History
                </h1>
                <button
                    onClick={loadAllDonations}
                    className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <p className="text-sm text-blue-700 font-medium mb-1">Total Donations</p>
                    <p className="text-3xl font-bold text-blue-900">{sortedDonations.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <p className="text-sm text-green-700 font-medium mb-1">Total Amount</p>
                    <p className="text-3xl font-bold text-green-900">{totalDonations.toFixed(4)} ETH</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <p className="text-sm text-purple-700 font-medium mb-1">Unique Donors</p>
                    <p className="text-3xl font-bold text-purple-900">
                        {new Set(allDonations.map((d) => d.donor)).size}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg p-4 shadow-md flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Campaign:</span>
                    <select
                        value={filterCampaign}
                        onChange={(e) => setFilterCampaign(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="all">All Campaigns</option>
                        {[...new Set(allDonations.map((d) => d.campaignId))].map((id) => (
                            <option key={id} value={id}>
                                Campaign #{id}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Donor:</span>
                    <input
                        type="text"
                        value={filterDonor}
                        onChange={(e) => setFilterDonor(e.target.value)}
                        placeholder="0x..."
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
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
                        <option value="highest">Highest Amount</option>
                        <option value="lowest">Lowest Amount</option>
                    </select>
                </div>
            </div>

            {/* Donations Table */}
            {sortedDonations.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">No donations found</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Campaign</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Donor</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Amount</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Reward</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold">Link</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sortedDonations.map((donation, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-800">#{donation.campaignId}</p>
                                                <p className="text-sm text-gray-600 truncate max-w-xs">{donation.campaignTitle}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                                                {formatAddress(donation.donor)}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-lg font-bold text-green-600">
                                                {parseFloat(donation.amount).toFixed(4)} ETH
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-700">{formatDate(donation.timestamp)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRewardBadgeColor(donation.rewardLevel)}`}>
                                                {getRewardIcon(donation.rewardLevel)} {getRewardLevelName(donation.rewardLevel)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <a
                                                href={getEtherscanUrl(donation.donor)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonationHistory;
