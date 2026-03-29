const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');

async function createCampaign(req, res) {
    try {
        const { title, description, goalAmount, category } = req.body;
        const campaign = new Campaign({
            title,
            description,
            goalAmount,
            category,
            image: req.file ? `/uploads/${req.file.filename}` : '',
            creator: req.user.id
        });
        await campaign.save();
        res.status(201).json(campaign);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getAllCampaigns(req, res) {
    try {
        const { search, category, limit } = req.query;
        let query = {};
        
        if (category) query.category = category;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        let findQuery = Campaign.find(query).populate('creator', 'name').sort({ createdAt: -1 });
        if (limit) findQuery = findQuery.limit(parseInt(limit));

        const campaigns = await findQuery;
        res.json(campaigns);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getCampaignById(req, res) {
    try {
        const campaign = await Campaign.findById(req.params.id).populate('creator', 'name');
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
        res.json(campaign);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getUserDashboardStats(req, res) {
    try {
        const userId = req.user.id;
        
        // Count campaigns created by user
        const campaigns = await Campaign.find({ creator: userId });
        const campaignIds = campaigns.map(c => c._id);
        
        // Total donations received in these campaigns
        const totalRaised = campaigns.reduce((sum, c) => sum + c.raisedAmount, 0);
        
        // Total unique donors for these campaigns
        const donations = await Donation.find({ campaignId: { $in: campaignIds } });
        const totalDonors = new Set(donations.map(d => d.donorName)).size;

        res.json({
            campaignCount: campaigns.length,
            totalRaised,
            totalDonors,
            campaigns: campaigns // optionally return the campaigns list too
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { 
    createCampaign, 
    getAllCampaigns, 
    getCampaignById, 
    getUserDashboardStats 
};
