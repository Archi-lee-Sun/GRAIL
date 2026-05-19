const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const lessonsController = require('../controllers/lessons.controller');
const sessionsController = require('../controllers/sessions.controller');

router.get('/:slug', auth, lessonsController.getLesson);
router.get('/:slug/stage/:stage', auth, sessionsController.startSession);
router.post('/:slug/stage/:stage/answer', auth, sessionsController.checkAnswer);
router.post('/:slug/stage/:stage/complete', auth, sessionsController.completeStage);

module.exports = router;
