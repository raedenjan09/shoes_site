const connection = require('../config/database');

// Admin: Get all reviews
exports.getAllReviews = (req, res) => {
    const sql = `
        SELECT r.review_id, r.rating, r.comment, r.created_at, u.name, i.description AS item_name
        FROM reviews r
        INNER JOIN users u ON r.user_id = u.id
        INNER JOIN item i ON r.item_id = i.item_id
        ORDER BY r.created_at DESC
    `;
    connection.execute(sql, [], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error', details: err });
        res.json({ reviews: results });
    });
}; 