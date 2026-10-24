const express = require('express');
const { auth, staffOnly } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const c = require('../controllers/staffController');

const router = express.Router();

router.post('/register', asyncHandler(c.register));
router.post('/login', asyncHandler(c.login));
router.get('/appointments', auth, staffOnly, asyncHandler(c.getAllAppointments));
router.patch('/appointments/:id/approve', auth, staffOnly, asyncHandler(c.approve));
router.patch('/appointments/:id/reject', auth, staffOnly, asyncHandler(c.reject));
router.patch('/appointments/:id/complete', auth, staffOnly, asyncHandler(c.complete));

module.exports = router;