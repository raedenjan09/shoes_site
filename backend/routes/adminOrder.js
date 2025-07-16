const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, isAdmin } = require('../middlewares/auth');
const adminOrderController = require('../controllers/adminOrder');

// List all orders (with optional filters)
router.get('/admin/orders', isAuthenticatedUser, isAdmin, adminOrderController.getAllOrders);
// Get details for a specific order
router.get('/admin/orders/:orderId', isAuthenticatedUser, isAdmin, adminOrderController.getOrderDetails);
// Update order status
router.patch('/admin/orders/:orderId/status', isAuthenticatedUser, isAdmin, adminOrderController.updateOrderStatus);

module.exports = router; 