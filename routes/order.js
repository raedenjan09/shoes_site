const express = require('express');

const router = express.Router();

const {createOrder, getUserOrders} = require('../controllers/order')
const {isAuthenticatedUser} = require('../middlewares/auth')

router.post('/create-order', isAuthenticatedUser, createOrder)
router.post('/order', require('../controllers/order').createOrder)
router.get('/orders', isAuthenticatedUser, getUserOrders)

module.exports = router;