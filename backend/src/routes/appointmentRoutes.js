const express = require('express');
const { auth, donorOnly } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const c = require('../controllers/appointmentController');

const router = express.Router();

router.post('/', auth, donorOnly, asyncHandler(c.bookAppointment));
router.get('/me', auth, donorOnly, asyncHandler(c.getMyAppointments));

module.exports = router;