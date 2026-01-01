import React, { useState } from "react";
import { createCampaign } from "../services/web3Service";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CampaignForm = ({ currentAccount }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        goalAmount: "",
        durationDays: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!currentAccount) {
            toast.error("Please connect your wallet first");
            return;
        }

        if (!formData.title || !formData.description || !formData.goalAmount || !formData.durationDays) {
            toast.error("All fields are required");
            return;
        }

        if (parseFloat(formData.goalAmount) <= 0) {
            toast.error("Goal amount must be greater than 0");
            return;
        }

        if (parseInt(formData.durationDays) <= 0) {
            toast.error("Duration must be greater than 0");
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await createCampaign(
                formData.title,
                formData.description,
                formData.goalAmount,
                formData.durationDays
            );

            // Save to backend
            try {
                const response = await fetch('http://localhost:5000/api/campaigns', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        blockchain_id: Number(result.campaignId),
                        creator_address: currentAccount,
                        title: formData.title,
                        description: formData.description,
                        goal_amount: formData.goalAmount,
                        duration_days: formData.durationDays,
                        transaction_hash: result.transactionHash
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Server responded with ${response.status}`);
                }
            } catch (backendError) {
                console.error("Error saving to backend:", backendError);
                toast.warning(`Campaign created on blockchain but failed to save to database: ${backendError.message}`);
                // We don't throw here because the blockchain tx succeeded
            }

            toast.success(
                <div>
                    <p className="font-semibold">Campaign created successfully!</p>
                    <p className="text-xs mt-1">Campaign ID: {result.campaignId.toString()}</p>
                    <p className="text-xs truncate">Tx: {result.transactionHash}</p>
                </div>
            );

            // Reset form
            setFormData({
                title: "",
                description: "",
                goalAmount: "",
                durationDays: "",
            });

            // Redirect to campaigns list
            setTimeout(() => {
                navigate("/");
            }, 2000);
        } catch (error) {
            console.error("Error creating campaign:", error);
            toast.error(error.message || "Failed to create campaign");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="text-4xl">🚀</span>
                Create New Campaign
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                        Campaign Title *
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Build a Community Center"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                        Description *
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe your campaign in detail..."
                        rows="5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        required
                    ></textarea>
                </div>

                {/* Goal Amount */}
                <div>
                    <label htmlFor="goalAmount" className="block text-sm font-semibold text-gray-700 mb-2">
                        Goal Amount (ETH) *
                    </label>
                    <input
                        type="number"
                        id="goalAmount"
                        name="goalAmount"
                        value={formData.goalAmount}
                        onChange={handleChange}
                        placeholder="e.g., 10"
                        step="0.01"
                        min="0.01"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Minimum: 0.01 ETH
                    </p>
                </div>

                {/* Duration */}
                <div>
                    <label htmlFor="durationDays" className="block text-sm font-semibold text-gray-700 mb-2">
                        Duration (Minutes) [TEST MODE] *
                    </label>
                    <input
                        type="number"
                        id="durationDays"
                        name="durationDays"
                        value={formData.durationDays}
                        onChange={handleChange}
                        placeholder="e.g., 30"
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        How long will the campaign run?
                    </p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || !currentAccount}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Creating Campaign...
                        </>
                    ) : (
                        <>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Campaign
                        </>
                    )}
                </button>

                {!currentAccount && (
                    <p className="text-center text-sm text-red-600 font-medium">
                        ⚠️ Please connect your wallet to create a campaign
                    </p>
                )}
            </form>
        </div>
    );
};

export default CampaignForm;
