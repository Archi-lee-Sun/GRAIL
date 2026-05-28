const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const arenaController = require('../controllers/arena.controller');

router.get('/current', auth, arenaController.getChallenge);
router.post('/:challenge_id/submit', auth, arenaController.submitArena);
router.get('/:challenge_id/leaderboard', auth, arenaController.getLeaderboard);

module.exports = router;
