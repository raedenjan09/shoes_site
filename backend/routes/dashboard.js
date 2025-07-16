const express = require('express');

const router = express.Router();


const {addressChart, salesChart, itemsChart} = require('../controllers/dashboard')
const {isAuthenticatedUser, isAdmin} = require('../middlewares/auth')
router.get('/address-chart', isAuthenticatedUser, isAdmin, addressChart)
router.get('/sales-chart', isAuthenticatedUser, isAdmin, salesChart)
router.get('/items-chart', isAuthenticatedUser, isAdmin, itemsChart)

module.exports = router;




