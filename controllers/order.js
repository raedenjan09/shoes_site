const connection = require('../config/database');
const sendEmail = require('../utils/sendEmail')

exports.createOrder = (req, res, next) => {
    console.log(req.body,)
    const { cart } = req.body;
    // Try to get userId from session or from req.body.user
    let userId = null;
    if (req.user && req.user.id) {
        userId = req.user.id;
    } else if (req.body.user && req.body.user.id) {
        userId = req.body.user.id;
    } else if (req.body.userId) {
        userId = req.body.userId;
    }
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    const dateOrdered = new Date();
    const dateShipped = new Date();
    connection.beginTransaction(err => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Transaction error', details: err });
        }
        // Get customer_id from userId
        const sql = 'SELECT c.customer_id, u.email FROM customer c INNER JOIN users u ON u.id = c.user_id WHERE u.id = ?';
        connection.execute(sql, [parseInt(userId)], (err, results) => {
            if (err || results.length === 0) {
                return connection.rollback(() => {
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Customer not found', details: err });
                    }
                });
            }
            const { customer_id, email } = results[0]
            // Insert into orderinfo
            const orderInfoSql = 'INSERT INTO orderinfo (customer_id, date_placed, date_shipped) VALUES (?, ?, ?)';
            connection.execute(orderInfoSql, [customer_id, dateOrdered, dateShipped], (err, result) => {
                if (err) {
                    return connection.rollback(() => {
                        if (!res.headersSent) {
                            res.status(500).json({ error: 'Error inserting orderinfo', details: err });
                        }
                    });
                }
                const order_id = result.insertId;
                // Insert each cart item into orderline
                const orderLineSql = 'INSERT INTO orderline (orderinfo_id, item_id, quantity) VALUES (?, ?, ?)';
                let errorOccurred = false;
                let completed = 0;
                if (cart.length === 0) {
                    return connection.rollback(() => {
                        if (!res.headersSent) {
                            res.status(400).json({ error: 'Cart is empty' });
                        }
                    });
                }
                cart.forEach((item, idx) => {
                    connection.execute(orderLineSql, [order_id, item.item_id, item.quantity], (err) => {
                        if (err && !errorOccurred) {
                            errorOccurred = true;
                            return connection.rollback(() => {
                                if (!res.headersSent) {
                                    res.status(500).json({ error: 'Error inserting orderline', details: err });
                                }
                            });
                        }
                        completed++;
                        if (completed === cart.length && !errorOccurred) {
                            connection.commit(async err => {
                                if (err) {
                                    return connection.rollback(() => {
                                        if (!res.headersSent) {
                                            res.status(500).json({ error: 'Commit error', details: err });
                                        }
                                    });
                                }
                                const message = 'your order is being processed'
                                try {
                                    await sendEmail({
                                        email,
                                        subject: 'Order Success',
                                        message
                                    })
                                }
                                catch (emailErr) {
                                    console.log('Email error:', emailErr);
                                }
                                if (!res.headersSent) {
                                    res.status(201).json({
                                        success: true,
                                        order_id,
                                        dateOrdered,
                                        message: 'transaction complete',
                                        cart
                                    });
                                }
                            });
                        }
                    });
                });
            });
        });
    });
}

exports.getUserOrders = (req, res) => {
    const userId = req.user.id;
    // Get all orders for the current user, with status and items
    const sql = `
        SELECT o.orderinfo_id, o.date_placed, o.date_shipped, o.status, 
               i.item_id, i.name AS item_name, i.image, ol.quantity
        FROM orderinfo o
        INNER JOIN customer c ON o.customer_id = c.customer_id
        INNER JOIN users u ON c.user_id = u.id
        INNER JOIN orderline ol ON o.orderinfo_id = ol.orderinfo_id
        INNER JOIN item i ON ol.item_id = i.item_id
        WHERE u.id = ?
        ORDER BY o.date_placed DESC, o.orderinfo_id DESC
    `;
    connection.execute(sql, [userId], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error fetching orders', details: err });
        }
        // Group by orderinfo_id
        const orders = {};
        results.forEach(row => {
            if (!orders[row.orderinfo_id]) {
                orders[row.orderinfo_id] = {
                    orderinfo_id: row.orderinfo_id,
                    date_placed: row.date_placed,
                    date_shipped: row.date_shipped,
                    status: row.status,
                    items: []
                };
            }
            orders[row.orderinfo_id].items.push({
                item_id: row.item_id,
                name: row.item_name,
                image: row.image,
                quantity: row.quantity
            });
        });
        return res.status(200).json({
            success: true,
            orders: Object.values(orders)
        });
    });
};

