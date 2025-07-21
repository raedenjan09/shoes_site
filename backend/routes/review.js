const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require('../middlewares/auth');
const reviewController = require('../controllers/review');

// User: Add a review (only if delivered)
router.post('/reviews', isAuthenticatedUser, reviewController.addReview);
// User: Get reviews for a product
router.get('/reviews/:itemId', reviewController.getReviewsForProduct);
// User: Update a review
router.put('/reviews', isAuthenticatedUser, reviewController.updateReview);
// User: Get current user's review for an item in a specific order
router.get('/reviews/user/:itemId', isAuthenticatedUser, reviewController.getUserReviewForProduct);

module.exports = router; 