const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const vaultController = require('../controllers/vault.controller');

router.get('/', auth, vaultController.getVault);
router.get('/:slug', auth, vaultController.getVaultEntry);

module.exports = router;
