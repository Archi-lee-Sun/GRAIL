const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const tracksRoutes = require('./tracks.routes');
const lessonsRoutes = require('./lessons.routes');
const usersRoutes = require('./users.routes');
const vaultRoutes = require('./vault.routes');

router.use('/auth', authRoutes);
router.use('/tracks', tracksRoutes);
router.use('/lessons', lessonsRoutes);
router.use('/users', usersRoutes);
router.use('/vault', vaultRoutes);


module.exports = router;
