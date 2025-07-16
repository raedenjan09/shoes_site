const connection = require('../config/database');

// User: Add a review (only if delivered)
exports.addReview = (req, res) => {
    const userId = req.user.id;
    const { item_id, rating, comment } = req.body;
    const sql = `
        SELECT o.status FROM orderinfo o
        INNER JOIN orderline ol ON o.orderinfo_id = ol.orderinfo_id
        WHERE o.status = 'delivered' AND ol.item_id = ? AND o.customer_id = (
            SELECT customer_id FROM customer WHERE user_id = ?
        )
        LIMIT 1
    `;
    connection.execute(sql, [item_id, userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error', details: err });
        if (results.length === 0) {
            return res.status(403).json({ error: 'You can only review delivered items.' });
        }
        connection.execute(
            'INSERT INTO reviews (user_id, item_id, rating, comment) VALUES (?, ?, ?, ?)',
            [userId, item_id, rating, comment],
            (err2) => {
                if (err2) return res.status(500).json({ error: 'Error saving review', details: err2 });
                res.json({ success: true });
            }
        );
    });
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