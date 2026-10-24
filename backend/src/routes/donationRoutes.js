const express = require('express');
const { auth, donorOnly } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const c = require('../controllers/donationController');

const router = express.Router();

router.get('/me', auth, donorOnly, asyncHandler(c.getMyDonations));

module.exports = router;