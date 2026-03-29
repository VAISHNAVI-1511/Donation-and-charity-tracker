const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');

async function createDonation(req, res) {
    try {
        const { donorName, amount, campaignId, message, donationType, paymentMethod, isAnonymous, wantsUpdates } = req.body;
        
        const donation = new Donation({ 
            donorName, 
            amount, 
            campaignId, 
            message, 
            donationType, 
            paymentMethod, 
            isAnonymous, 
            wantsUpdates 
        });
        await donation.save();

        // Update Campaign Raised Amount
        const campaign = await Campaign.findById(campaignId);
        if (campaign) {
            campaign.raisedAmount += Number(amount);
            await campaign.save();
        }

        res.status(201).json(donation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getDonationsByCampaign(req, res) {
    try {
        const donations = await Donation.find({ campaignId: req.params.campaignId }).sort({ date: -1 });
        res.json(donations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getTopDonors(req, res) {
    try {
        const topDonors = await Donation.aggregate([
            {
                $group: {
                    _id: "$donorName",
                    totalDonated: { $sum: "$amount" }
                }
            },
            { $sort: { totalDonated: -1 } },
            { $limit: 5 }
        ]);
        
        // Map _id back to donorName for cleaner response
        const formattedDonors = topDonors.map(d => ({
            donorName: d._id,
            totalDonated: d.totalDonated
        }));

        res.json(formattedDonors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { createDonation, getDonationsByCampaign, getTopDonors };
