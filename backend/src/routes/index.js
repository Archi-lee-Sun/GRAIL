const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const tracksRoutes = require('./tracks.routes');
const lessonsRoutes = require('./lessons.routes');

router.use('/auth', authRoutes);
router.use('/tracks', tracksRoutes);
router.use('/lessons', lessonsRoutes);


module.exports = router;
