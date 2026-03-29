const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');

// Admin Stats
router.get('/stats', auth, admin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCampaigns = await Campaign.countDocuments();
        const donations = await Donation.find();
        const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);

        res.json({ totalUsers, totalCampaigns, totalDonations });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Manage Campaigns (Delete fake/expired)
router.delete('/campaigns/:id', auth, admin, async (req, res) => {
    try {
        await Campaign.findByIdAndDelete(req.params.id);
        res.json({ message: 'Campaign deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
