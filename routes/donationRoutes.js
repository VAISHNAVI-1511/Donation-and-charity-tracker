const express = require('express');
const router = express.Router();
const { createDonation, getDonationsByCampaign, getTopDonors } = require('../controllers/donationController');

router.post('/', createDonation);
router.get('/campaign/:campaignId', getDonationsByCampaign);
router.get('/top-donors', getTopDonors);

module.exports = router;
