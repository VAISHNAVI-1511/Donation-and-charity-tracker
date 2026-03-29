const express = require('express');
const router = express.Router();
const { 
    createCampaign, 
    getAllCampaigns, 
    getCampaignById, 
    getUserDashboardStats 
} = require('../controllers/campaignController');
const { auth } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `campaign-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

router.get('/user-stats', auth, getUserDashboardStats);
router.post('/', auth, upload.single('image'), createCampaign);
router.get('/', getAllCampaigns);
router.get('/:id', getCampaignById);

module.exports = router;
