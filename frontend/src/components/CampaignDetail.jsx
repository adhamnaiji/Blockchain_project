import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getCampaign,
    getCampaignDonations,
    getDonorAmount,
    donate,
    pauseCampaign,
    resumeCampaign,
    withdrawFunds,
    requestRefund,
    getCampaignStatus,
    getDaysRemaining,
    formatAddress,
    formatDate,
    getRewardLevelName,
    calculateRewardLevel,
    getEtherscanUrl,
} from "../services/web3Service";
import { toast } from "react-toastify";

const CampaignDetail = ({ currentAccount }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);
    const [donations, setDonations] = useState([]);
    const [donorAmount, setDonorAmount] = useState("0");
    const [loading, setLoading] = useState(true);
    const [donationAmount, setDonationAmount] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        loadCampaignData();
    }, [id, currentAccount]);

    const loadCampaignData = async () => {
        try {
            setLoading(true);
            const campaignData = await getCampaign(id);
            setCampaign(campaignData);

            const donationsData = await getCampaignDonations(id);
            setDonations(donationsData);

            if (currentAccount) {
                const amount = await getDonorAmount(id, currentAccount);
                setDonorAmount(amount);
            }
        } catch (error) {
            console.error("Error loading campaign:", error);
            toast.error("Failed to load campaign details");
        } finally {
            setLoading(false);
        }
    };

    const handleDonate = async (e) => {
        e.preventDefault();

        if (!currentAccount) {
            toast.error("Please connect your wallet first");
            return;
        }

        if (!donationAmount || parseFloat(donationAmount) <= 0) {
            toast.error("Please enter a valid donation amount");
            return;
        }

        setIsProcessing(true);

        try {
            const result = await donate(id, donationAmount);
            const rewardLevel = getRewardLevelName(result.rewardLevel);

            toast.success(
                <div>
                    <p className="font-semibold">Donation successful! 🎉</p>
                    <p className="text-sm">Reward: {rewardLevel}</p>
                    <p className="text-xs truncate">Tx: {result.transactionHash}</p>
                </div>
            );

            setDonationAmount("");
            await loadCampaignData();
        } catch (error) {
            console.error("Error donating:", error);
            toast.error(error.message || "Failed to donate");
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePause = async () => {
        setIsProcessing(true);
        try {
            await pauseCampaign(id);
            toast.success("Campaign paused successfully");
            await loadCampaignData();
        } catch (error) {
            console.error("Error pausing campaign:", error);
            toast.error(error.message || "Failed to pause campaign");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleResume = async () => {
        setIsProcessing(true);
        try {
            await resumeCampaign(id);
            toast.success("Campaign resumed successfully");
            await loadCampaignData();
        } catch (error) {
            console.error("Error resuming campaign:", error);
            toast.error(error.message || "Failed to resume campaign");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleWithdraw = async () => {
        if (!window.confirm("Are you sure you want to withdraw all funds?")) {
            return;
        }

        setIsProcessing(true);
        try {
            await withdrawFunds(id);
            toast.success("Funds withdrawn successfully! 💰");
            await loadCampaignData();
        } catch (error) {
            console.error("Error withdrawing funds:", error);
            toast.error(error.message || "Failed to withdraw funds");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRefund = async () => {
        if (!window.confirm("Request a refund for this campaign?")) {
            return;
        }

        setIsProcessing(true);
        try {
            await requestRefund(id);
            toast.success("Refund processed successfully! 💸");
            await loadCampaignData();
        } catch (error) {
            console.error("Error requesting refund:", error);
            toast.error(error.message || "Failed to process refund");
        } finally {
            setIsProcessing(false);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading campaign...</p>
                </div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="text-center py-16">
                <p className="text-red-600 text-lg">Campaign not found</p>
                <button
                    onClick={() => navigate("/")}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                    Back to Campaigns
                </button>
            </div>
        );
    }

    const status = getCampaignStatus(campaign);
    const daysLeft = getDaysRemaining(campaign.deadline);
    const progress = (parseFloat(campaign.collectedAmount) / parseFloat(campaign.goalAmount)) * 100;
    const isCreator = currentAccount && currentAccount.toLowerCase() === campaign.creator.toLowerCase();
    const hasDonated = parseFloat(donorAmount) > 0;
    const currentReward = donationAmount ? calculateRewardLevel(donationAmount) : null;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Campaigns
            </button>

            {/* Campaign Header */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">{campaign.title}</h1>
                        <p className="text-gray-600">Campaign #{campaign.id}</p>
                    </div>
                    <span
                        className={`px-4 py-2 rounded-full text-sm font-bold border ${status === "Open"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : status === "Funded"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : status === "Paused"
                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                    : "bg-red-100 text-red-800 border-red-200"
                            }`}
                    >
                        {status}
                    </span>
                </div>

                <p className="text-gray-700 mb-6 text-lg">{campaign.description}</p>

                {/* Creator */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Created by</p>
                    <a
                        href={getEtherscanUrl(campaign.creator)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-mono font-medium flex items-center gap-2"
                    >
                        {formatAddress(campaign.creator)}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                    {isCreator && (
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                            👤 You are the creator
                        </span>
                    )}
                </div>

                {/* Progress */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-gray-700">Funding Progress</span>
                        <span className="text-gray-600">{Math.min(progress, 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between mt-3">
                        <div>
                            <p className="text-sm text-gray-600">Collected</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {parseFloat(campaign.collectedAmount).toFixed(4)} ETH
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Goal</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {parseFloat(campaign.goalAmount).toFixed(4)} ETH
                            </p>
                        </div>
                    </div>
                </div>

                {/* Deadline */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div>
                        <p className="text-sm text-gray-600">Deadline</p>
                        <p className="text-lg font-bold text-gray-800">{formatDate(campaign.deadline)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Time Remaining</p>
                        <p className="text-lg font-bold text-gray-800">
                            {daysLeft > 0 ? `${daysLeft} days` : "Expired"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Donation Section */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Donate */}
                    {status === "Open" && (
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="text-3xl">💰</span>
                                Make a Donation
                            </h2>
                            <form onSubmit={handleDonate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Amount (ETH)
                                    </label>
                                    <input
                                        type="number"
                                        value={donationAmount}
                                        onChange={(e) => setDonationAmount(e.target.value)}
                                        placeholder="e.g., 0.5"
                                        step="0.01"
                                        min="0.01"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        disabled={isProcessing || !currentAccount}
                                    />
                                    {currentReward && (
                                        <p className="mt-2 text-sm">
                                            You will receive:{" "}
                                            <span className={`font-bold px-2 py-1 rounded ${currentReward.level === 3 ? "bg-yellow-100 text-yellow-800" : currentReward.level === 2 ? "bg-gray-100 text-gray-800" : currentReward.level === 1 ? "bg-orange-100 text-orange-800" : ""}`}>
                                                {getRewardIcon(currentReward.level)} {currentReward.name} Reward
                                            </span>
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        🥉 Bronze: ≥0.1 ETH | 🥈 Silver: ≥0.5 ETH | 🥇 Gold: ≥1.0 ETH
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isProcessing || !currentAccount || !donationAmount}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Donate Now
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Donations List */}
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-3xl">🎁</span>
                            Donations ({donations.length})
                        </h2>
                        {donations.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No donations yet. Be the first!</p>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {donations.map((donation, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRewardBadgeColor(donation.rewardLevel)}`}>
                                                {getRewardIcon(donation.rewardLevel)} {getRewardLevelName(donation.rewardLevel)}
                                            </span>
                                            <div>
                                                <a
                                                    href={getEtherscanUrl(donation.donor)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline font-mono text-sm"
                                                >
                                                    {formatAddress(donation.donor)}
                                                </a>
                                                <p className="text-xs text-gray-500">{formatDate(donation.timestamp)}</p>
                                            </div>
                                        </div>
                                        <p className="text-lg font-bold text-green-600">
                                            {parseFloat(donation.amount).toFixed(4)} ETH
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Actions */}
                <div className="space-y-6">
                    {/* Creator Actions */}
                    {isCreator && (
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="text-2xl">⚙️</span>
                                Creator Actions
                            </h3>
                            <div className="space-y-3">
                                {!campaign.isPaused && !campaign.isFunded && !campaign.expired && (
                                    <button
                                        onClick={handlePause}
                                        disabled={isProcessing}
                                        className="w-full bg-yellow-600 text-white py-2.5 rounded-lg font-semibold hover:bg-yellow-700 transition-all disabled:opacity-50"
                                    >
                                        ⏸️ Pause Campaign
                                    </button>
                                )}
                                {campaign.isPaused && (
                                    <button
                                        onClick={handleResume}
                                        disabled={isProcessing}
                                        className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50"
                                    >
                                        ▶️ Resume Campaign
                                    </button>
                                )}
                                {parseFloat(campaign.collectedAmount) >= parseFloat(campaign.goalAmount) && !campaign.isFunded && (
                                    <button
                                        onClick={handleWithdraw}
                                        disabled={isProcessing}
                                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
                                    >
                                        💰 Withdraw Funds
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Donor Actions */}
                    {hasDonated && (
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="text-2xl">👤</span>
                                Your Donation
                            </h3>
                            <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                <p className="text-sm text-gray-600">You donated</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {parseFloat(donorAmount).toFixed(4)} ETH
                                </p>
                            </div>
                            {campaign.expired && parseFloat(campaign.collectedAmount) < parseFloat(campaign.goalAmount) && (
                                <button
                                    onClick={handleRefund}
                                    disabled={isProcessing}
                                    className="w-full bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
                                >
                                    💸 Request Refund
                                </button>
                            )}
                        </div>
                    )}

                    {/* Info */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-3">ℹ️ Information</h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li>✅ All transactions are secured on Ethereum blockchain</li>
                            <li>✅ Transparent donation tracking</li>
                            <li>✅ Automatic refunds if campaign fails</li>
                            <li>✅ Earn rewards based on donation amount</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetail;
