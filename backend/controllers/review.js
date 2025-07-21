const connection = require('../config/database');

// User: Add a review (only if delivered)
exports.addReview = (req, res) => {
    const userId = req.user.id;
    const { item_id, rating, comment, orderinfo_id } = req.body;
    console.log('addReview called with:', { item_id, userId, orderinfo_id });
    const sql = `
        SELECT o.status FROM orderinfo o
        INNER JOIN orderline ol ON o.orderinfo_id = ol.orderinfo_id
        WHERE o.status = 'delivered' AND ol.item_id = ? AND o.customer_id = (
            SELECT customer_id FROM customer WHERE user_id = ?
        ) AND o.orderinfo_id = ?
        LIMIT 1
    `;
    console.log('SQL params:', [item_id, userId, orderinfo_id]);
    connection.execute(sql, [item_id, userId, orderinfo_id], (err, results) => {
        if (err) {
            console.log('SQL error:', err);
            return res.status(500).json({ error: 'Database error', details: err });
        }
        console.log('SQL results:', results);
        if (results.length === 0) {
            return res.status(403).json({ error: 'You can only review delivered items.' });
        }
        // Check if review already exists
        const checkReviewSql = 'SELECT * FROM reviews WHERE user_id = ? AND item_id = ? AND orderinfo_id = ?';
        connection.execute(checkReviewSql, [userId, item_id, orderinfo_id], (err3, existingReviews) => {
            if (err3) return res.status(500).json({ error: 'Database error', details: err3 });
            if (existingReviews.length > 0) {
                return res.status(409).json({ error: 'You have already reviewed this item for this order.' });
            }
            connection.execute(
                'INSERT INTO reviews (user_id, item_id, orderinfo_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
                [userId, item_id, orderinfo_id, rating, comment],
                (err2) => {
                    if (err2) return res.status(500).json({ error: 'Error saving review', details: err2 });
                    res.json({ success: true });
                }
            );
        });
    });
};

// User: Update a review
exports.updateReview = (req, res) => {
    const userId = req.user.id;
    const { item_id, rating, comment, orderinfo_id } = req.body;
    connection.execute(
        'UPDATE reviews SET rating = ?, comment = ? WHERE user_id = ? AND item_id = ? AND orderinfo_id = ?',
        [rating, comment, userId, item_id, orderinfo_id],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Error updating review', details: err });
            res.json({ success: true });
        }
    );
};

// User: Get current user's review for an item in a specific order
exports.getUserReviewForProduct = (req, res) => {
    const userId = req.user.id;
    const itemId = req.params.itemId;
    const orderinfoId = req.query.orderinfo_id;

    if (!orderinfoId) {
        return res.status(400).json({ error: 'orderinfo_id query parameter is required.' });
    }

    connection.execute(
        'SELECT * FROM reviews WHERE user_id = ? AND item_id = ? AND orderinfo_id = ?',
        [userId, itemId, orderinfoId],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error', details: err });
            res.json({ review: results[0] || null });
        }
    );
};

// User: Get reviews for a product
exports.getReviewsForProduct = (req, res) => {
    const itemId = req.params.itemId;
    const sql = `
        SELECT r.review_id, r.rating, r.comment, r.created_at, u.name
        FROM reviews r
        INNER JOIN users u ON r.user_id = u.id
        WHERE r.item_id = ?
        ORDER BY r.created_at DESC
    `;
    connection.execute(sql, [itemId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error', details: err });
        res.json({ reviews: results });
    });
}; 