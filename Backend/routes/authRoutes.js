const express = require('express');
const router = express.Router();
const { register, login, googleAuth, getProfile, deleteAccount } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/profile', auth, getProfile);
router.delete('/account', auth, deleteAccount);

module.exports = router;
