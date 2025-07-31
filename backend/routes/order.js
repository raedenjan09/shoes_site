const express = require('express');

const router = express.Router();

const {createOrder, getUserOrders, getUserOrdersById, cancelOrder} = require('../controllers/order')
const {isAuthenticatedUser, isAdmin} = require('../middlewares/auth')

router.post('/create-order', isAuthenticatedUser, createOrder)
router.post('/order', isAuthenticatedUser, require('../controllers/order').createOrder)
router.get('/orders', isAuthenticatedUser, getUserOrders)
router.get('/orders/:id', isAuthenticatedUser, isAdmin, getUserOrdersById)
router.put('/orders/:orderId/status', isAuthenticatedUser, isAdmin, require('../controllers/order').updateOrderStatus)
router.get('/order/:orderId', isAuthenticatedUser, require('../controllers/order').getOrderDetailsForUser)
router.patch('/orders/:orderId/cancel', isAuthenticatedUser, cancelOrder)

module.exports = router;
