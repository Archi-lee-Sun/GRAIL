const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/send-verification', authController.sendVerification);
router.post('/verify-code', authController.verifyEmailCode);

router.get('/me', auth, authController.getMe);

module.exports = router;
