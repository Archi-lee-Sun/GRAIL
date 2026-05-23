const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const usersController = require('../controllers/users.controller');

router.get('/me/dashboard', auth, usersController.getDashboard);
router.get('/me/reviews', auth, usersController.getReviews);
router.get('/me/learning-path/:lessonId', auth, usersController.getLearningPath);
router.post('/me/reviews/:lessonId', auth, usersController.submitReview);

module.exports = router;
