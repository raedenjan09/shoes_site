const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

const items = require('./routes/item');
const users = require('./routes/user')
const orders = require('./routes/order')
const dashboard = require('./routes/dashboard');
const adminOrderRoutes = require('./routes/adminOrder');
const reviewRoutes = require('./routes/review');
const adminReviewRoutes = require('./routes/adminReview');
const { scheduleTokenCleanup } = require('./utils/tokenUtils');

app.use(cors())

// Middleware for parsing JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the front-end directory
app.use(express.static(path.join(__dirname, '../front-end')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// API routes
app.use('/api/v1', items);
app.use('/api/v1', users);
app.use('/api/v1', orders);
app.use('/api/v1', dashboard);
app.use('/api/v1', adminOrderRoutes);
app.use('/api/v1', reviewRoutes);
app.use('/api/v1', adminReviewRoutes);

// Schedule token cleanup
scheduleTokenCleanup();

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../front-end/home.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../front-end/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../front-end/register.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../front-end/profile.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../front-end/dashboard.html'));
});

app.get('/item', (req, res) => {
    res.sendFile(path.join(__dirname, '../front-end/item.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, '../front-end/cart.html'));
});

app.get('/deactivate', (req, res) => {
    res.sendFile(path.join(__dirname, '../front-end/deactivate.html'));
});

// Handle 404 errors - Express 5.x compatible
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

module.exports = app