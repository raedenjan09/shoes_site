const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, isAdmin } = require('../middlewares/auth');
const adminReviewController = require('../controllers/adminReview');

// Admin: Get all reviews
router.get('/admin/reviews', isAuthenticatedUser, isAdmin, adminReviewController.getAllReviews);

module.exports = router; 