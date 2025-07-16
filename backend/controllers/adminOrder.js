const connection = require('../config/database');
const sendEmail = require('../utils/sendEmail');
const path = require('path');

// Get all orders (with optional status/user filter)
exports.getAllOrders = (req, res) => {
    let sql = `
        SELECT o.orderinfo_id, o.date_placed, o.date_shipped, o.status, 
               u.id as user_id, u.email, CONCAT(c.fname, ' ', c.lname) as user_name,
               SUM(i.sell_price * ol.quantity) as total
        FROM orderinfo o
        INNER JOIN customer c ON o.customer_id = c.customer_id
        INNER JOIN users u ON c.user_id = u.id
        INNER JOIN orderline ol ON o.orderinfo_id = ol.orderinfo_id
        INNER JOIN item i ON ol.item_id = i.item_id
    `;
    const params = [];
    const filters = [];
    if (req.query.status) {
        filters.push('o.status = ?');
        params.push(req.query.status);
    }
    if (req.query.user) {
        filters.push('(u.email LIKE ? OR c.fname LIKE ? OR c.lname LIKE ?)');
        params.push(`%${req.query.user}%`, `%${req.query.user}%`, `%${req.query.user}%`);
    }
    if (filters.length) sql += ' WHERE ' + filters.join(' AND ');
    sql += ' GROUP BY o.orderinfo_id ORDER BY o.date_placed DESC';

    connection.execute(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching orders', details: err });
        res.json({ orders: results });
    });
};

// Get order details
exports.getOrderDetails = (req, res) => {
    const orderId = req.params.orderId;
    const sql = `
        SELECT o.orderinfo_id, o.date_placed, o.date_shipped, o.status, 
               u.id as user_id, u.email, CONCAT(c.fname, ' ', c.lname) as name,
               i.item_id, i.description AS item_name, i.image, ol.quantity, i.sell_price as unit_price
        FROM orderinfo o
        INNER JOIN customer c ON o.customer_id = c.customer_id
        INNER JOIN users u ON c.user_id = u.id
        INNER JOIN orderline ol ON o.orderinfo_id = ol.orderinfo_id
        INNER JOIN item i ON ol.item_id = i.item_id
        WHERE o.orderinfo_id = ?
    `;
    connection.execute(sql, [orderId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching order details', details: err });
        if (!results.length) return res.status(404).json({ error: 'Order not found' });
        const order = {
            orderinfo_id: results[0].orderinfo_id,
            date_placed: results[0].date_placed,
            date_shipped: results[0].date_shipped,
            status: results[0].status,
            user: { id: results[0].user_id, email: results[0].email, name: results[0].name },
            items: results.map(row => ({
                item_id: row.item_id,
                name: row.item_name,
                image: row.image,
                quantity: row.quantity,
                unit_price: row.unit_price
            }))
        };
        res.json({ order });
    });
};

// Update order status
exports.updateOrderStatus = (req, res) => {
    const orderId = req.params.orderId;
    const { status } = req.body;
    let sql, params;
    if (status === 'delivered') {
        sql = 'UPDATE orderinfo SET status = ?, date_shipped = NOW() WHERE orderinfo_id = ?';
        params = [status, orderId];
    } else {
        sql = 'UPDATE orderinfo SET status = ? WHERE orderinfo_id = ?';
        params = [status, orderId];
    }
    connection.execute(sql, params, (err) => {
        if (err) return res.status(500).json({ error: 'Error updating status', details: err });

        // Fetch order, user, and items for email
        const orderSql = `
            SELECT o.orderinfo_id, o.date_placed, o.date_shipped, o.status, 
                   u.email, c.fname, c.lname,
                   i.item_id, i.description AS item_name, i.image, ol.quantity, i.sell_price
            FROM orderinfo o
            INNER JOIN customer c ON o.customer_id = c.customer_id
            INNER JOIN users u ON c.user_id = u.id
            INNER JOIN orderline ol ON o.orderinfo_id = ol.orderinfo_id
            INNER JOIN item i ON ol.item_id = i.item_id
            WHERE o.orderinfo_id = ?
        `;
        connection.execute(orderSql, [orderId], async (err2, results) => {
            if (err2 || !results.length) {
                return res.json({ success: true, warning: 'Order updated but email not sent (order not found)' });
            }
            const { email, fname, lname, date_placed } = results[0];
            const itemsHtml = results.map(item => {
                const subtotal = Number(item.sell_price) * item.quantity;
                return `
                <tr>
                    <td style="padding:8px;text-align:center;">
                        <img src="cid:logoShoes" alt="${item.item_name}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;">
                    </td>
                    <td style="padding:8px;">${item.item_name}</td>
                    <td style="padding:8px;text-align:center;">${item.quantity}</td>
                    <td style="padding:8px;text-align:right;">₱${Number(item.sell_price).toFixed(2)}</td>
                    <td style="padding:8px;text-align:right;">₱${subtotal.toFixed(2)}</td>
                </tr>
                `;
            }).join('');
            const total = results.reduce((sum, item) => sum + Number(item.sell_price) * item.quantity, 0);
            const statusLabel = status.toUpperCase();
            const html = `
<div style="background:#fafbfc;min-height:100vh;padding:0;margin:0;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:650px;margin:32px auto 0 auto;background:#fff;border-radius:14px;padding:0 0 32px 0;box-shadow:0 2px 12px rgba(0,0,0,0.04);">
    <div style="text-align:center;padding-top:32px;">
      <img src="cid:logoShoes" alt="Shoes Site Logo" style="width:110px;margin-bottom:12px;border-radius:8px;">
      <h1 style="font-size:2.1em;font-weight:700;margin:0 0 8px 0;letter-spacing:-1px;">Order Status Update</h1>
    </div>
    <div style="padding:0 40px;">
      <p style="font-size:1.1em;margin:24px 0 0 0;">Hi ${fname} ${lname.toLowerCase()},</p>
      <div style="background:#fff;border-radius:12px;padding:24px 24px 16px 24px;margin:24px 0 0 0;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
        <p style="margin:0 0 12px 0;font-size:1.08em;">
          Your order <b>#$${orderId}</b> placed on <b>${new Date(date_placed).toLocaleString()}</b> has been updated to:<br>
          <span style="display:inline-block;margin-top:10px;margin-bottom:10px;"><span style="background:#0078f2;color:#fff;font-weight:600;padding:7px 22px;border-radius:22px;font-size:1em;letter-spacing:0.5px;">${statusLabel}</span></span>
        </p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0 0 0;">
          <thead>
            <tr style="background:#f2f2f2;">
              <th style="padding:8px 6px;text-align:left;font-weight:600;font-size:1em;border-bottom:1px solid #e0e0e0;">Photo</th>
              <th style="padding:8px 6px;text-align:left;font-weight:600;font-size:1em;border-bottom:1px solid #e0e0e0;">Item</th>
              <th style="padding:8px 6px;text-align:center;font-weight:600;font-size:1em;border-bottom:1px solid #e0e0e0;">Quantity</th>
              <th style="padding:8px 6px;text-align:right;font-weight:600;font-size:1em;border-bottom:1px solid #e0e0e0;">Unit Price</th>
              <th style="padding:8px 6px;text-align:right;font-weight:600;font-size:1em;border-bottom:1px solid #e0e0e0;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div style="font-size:1.13em;margin-top:16px;font-weight:600;">Total: ₱${total.toFixed(2)}</div>
        <div style="color:#888;font-size:0.98em;margin-top:18px;">If you have any questions, please contact support.</div>
      </div>
      <div style="margin-top:32px;font-size:1.05em;">Thank you for shopping with us!</div>
    </div>
  </div>
</div>
`;
            try {
                await sendEmail({
                    email,
                    subject: 'Order Status Update',
                    html,
                    attachments: [{
                        filename: 'logo-shoes.jpg',
                        path: path.join(__dirname, '../images/logo-shoes.jpg'),
                        cid: 'logoShoes'
                    }]
                });
            } catch (emailErr) {
                console.log('Email error:', emailErr);
            }
            res.json({ success: true });
        });
    });
}; 