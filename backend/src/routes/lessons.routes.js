const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const lessonsController = require('../controllers/lessons.controller');

router.get('/:slug', auth, lessonsController.getLesson);

module.exports = router;
