const express = require('express');
const { auth, donorOnly } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const c = require('../controllers/donorController');

const router = express.Router();

router.post('/register', asyncHandler(c.register));
router.post('/login', asyncHandler(c.login));
router.get('/me', auth, donorOnly, asyncHandler(c.getMe));
router.put('/me', auth, donorOnly, asyncHandler(c.updateMe));

module.exports = router;