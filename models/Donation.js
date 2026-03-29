const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    donorName: { type: String, required: true },
    amount: { type: Number, required: true },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    message: { type: String },
    donationType: { type: String, enum: ['once', 'monthly'], default: 'once' },
    paymentMethod: { type: String, enum: ['gpay', 'card', 'debit'], required: true },
    isAnonymous: { type: Boolean, default: false },
    wantsUpdates: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donation', donationSchema);
