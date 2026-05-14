const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tracksController = require('../controllers/tracks.controller');

router.get('/', auth, tracksController.listTracks);
router.get('/:slug/lessons', auth, tracksController.listTrackLessons);
router.get('/:slug', auth, tracksController.getTrack);

module.exports = router;
