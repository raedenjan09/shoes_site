const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require('../middlewares/auth');
const reviewController = require('../controllers/review');

// User: Add a review (only if delivered)
router.post('/reviews', isAuthenticatedUser, reviewController.addReview);
// User: Get reviews for a product
router.get('/reviews/:itemId', reviewController.getReviewsForProduct);

module.exports = router; 