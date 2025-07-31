const connection = require('../config/database');
const sendEmail = require('../utils/sendEmail')
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateOrderPDF({ order_id, dateOrdered, fname, lname, address, cart, productMap, total }) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        // Logo
        const logoPath = path.join(__dirname, '../images/logo-shoes.jpg');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, doc.page.width / 2 - 60, 15, { width: 120 });
        }
        doc.moveDown(4);

        // Title
        doc.font('Helvetica-Bold').fontSize(24).fillColor('#0078f2').text('Order Receipt', { align: 'center' });
        doc.moveDown(1);

        // Order Info
        doc.font('Helvetica').fontSize(12).fillColor('black');
        doc.text(`Order #: ${order_id}`, { continued: true }).text(`   Date: ${dateOrdered.toLocaleString()}`, { align: 'right' });
        doc.text(`Customer: ${fname} ${lname}`);
        if (address) doc.text(`Address: ${address}`);
        doc.moveDown(1.5);

        // Table Header
        doc.font('Helvetica-Bold').fontSize(14).fillColor('#0078f2').text('Items:', { underline: true });
        doc.moveDown(0.7);

        // Table Columns
        doc.font('Helvetica-Bold').fontSize(12).fillColor('black');
        doc.text('Item', 50, doc.y, { continued: true, width: 200 });
        doc.text('Qty', 270, doc.y, { continued: true, width: 50, align: 'center' });
        doc.text('Unit Price', 320, doc.y, { continued: true, width: 80, align: 'right' });
        doc.text('Subtotal', 400, doc.y, { width: 100, align: 'right' });
        doc.moveDown(0.3);
        doc.moveTo(50, doc.y).lineTo(520, doc.y).stroke('#0078f2');
        doc.moveDown(0.3);

        // Table Rows
        cart.forEach(item => {
            const prod = productMap[item.item_id];
            const subtotal = Number(prod.sell_price) * item.quantity;
            doc.font('Helvetica').fontSize(11).fillColor('black');
            doc.text(prod.description, 50, doc.y, { continued: true, width: 200 });
            doc.text(item.quantity.toString(), 270, doc.y, { continued: true, width: 50, align: 'center' });
            doc.text(`₱${Number(prod.sell_price).toFixed(2)}`, 320, doc.y, { continued: true, width: 80, align: 'right' });
            doc.text(`₱${subtotal.toFixed(2)}`, 400, doc.y, { width: 100, align: 'right' });
            doc.moveDown(0.4);
            // Add a light gray background for rows
            const y = doc.y - 15;
            doc.rect(50, y, 450, 20).fillOpacity(0.02).fillAndStroke('#0078f2', '#0078f2');
            doc.fillOpacity(1);
        });

        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(520, doc.y).stroke('#0078f2');
        doc.moveDown(0.5);

        // Total
        doc.font('Helvetica-Bold').fontSize(14).fillColor('black').text(`Total: ₱${total.toFixed(2)}`, 400, doc.y, { width: 100, align: 'right' });
        doc.moveDown(2);

        // Thank you note
        doc.font('Helvetica-Bold').fontSize(13).fillColor('#0078f2').text('Thank you for shopping with Shoes Site!', { align: 'center' });
        doc.moveDown(0.7);
        doc.font('Helvetica').fontSize(10).fillColor('gray').text('If you have any questions, contact support at support@shoessite.com', { align: 'center' });

        doc.end();
    });
}

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
        const sql = 'SELECT c.customer_id, u.email, c.fname, c.lname, c.addressline FROM customer c INNER JOIN users u ON u.id = c.user_id WHERE u.id = ?';        
        connection.execute(sql, [parseInt(userId)], (err, results) => {
            if (err || results.length === 0) {
                return connection.rollback(() => {
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Customer not found', details: err });
                    }
                });
            }
            const { customer_id, email, fname, lname, addressline } = results[0];
            const address = addressline;
            // Insert into orderinfo
            const orderInfoSql = 'INSERT INTO orderinfo (customer_id, date_placed, date_shipped, status) VALUES (?, ?, ?, ?)';
            connection.execute(orderInfoSql, [customer_id, dateOrdered, null, 'Pending'], (err, result) => {
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
                    const itemIds = cart.map(item => item.item_id);
                    const placeholders = itemIds.map(() => '?').join(',');
                    const itemSql = `SELECT item_id, description, image, sell_price FROM item WHERE item_id IN (${placeholders})`;
                    connection.query(itemSql, itemIds, async function (err, results, fields) {
                        if (err) {
                            console.log('Query error:', err);
                            return;
                        }
                        if (!results) {
                            console.log('No results returned from item query');
                            return;
                        }
                        const productMap = {};
                        results.forEach(p => productMap[p.item_id] = p);
                        let itemsHtml = '';
                        let total = 0;
                        cart.forEach(item => {
                            const prod = productMap[item.item_id];
                            const sellPrice = Number(prod.sell_price);
                            const subtotal = sellPrice * item.quantity;
                            total += subtotal;
                            itemsHtml += `
                            <tr>
                                <td style="padding:8px;text-align:center;">
                                    <img src="cid:logoShoes" alt="${prod.description}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;">
                                </td>
                                <td style="padding:8px;">${prod.description}</td>
                                <td style="padding:8px;text-align:center;">${item.quantity}</td>
                                <td style="padding:8px;text-align:right;">₱${sellPrice.toFixed(2)}</td>
                                <td style="padding:8px;text-align:right;">₱${subtotal.toFixed(2)}</td>
                            </tr>
                            `;
                        });
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
          Your order placed on <b>${dateOrdered.toLocaleString()}</b> has been updated to:<br>
          <span style="display:inline-block;margin-top:10px;margin-bottom:10px;"><span style="background:#0078f2;color:#fff;font-weight:600;padding:7px 22px;border-radius:22px;font-size:1em;letter-spacing:0.5px;">PLACED</span></span>
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
                            const pdfBuffer = await generateOrderPDF({ order_id, dateOrdered, fname, lname, address, cart, productMap, total });
                            await sendEmail({
                                email,
                                subject: 'Order Success',
                                html,
                                attachments: [{
                                    filename: 'logo-shoes.jpg',
                                path: require('path').join(__dirname, '../images/logo-shoes.jpg'),
                                    cid: 'logoShoes'
                                }, { filename: `Order_${order_id}_Receipt.pdf`, content: pdfBuffer }]
                            });
                        } catch (emailErr) {
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
               i.item_id, i.description AS item_name, i.image, ol.quantity
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

exports.getUserOrdersById = (req, res) => {
    const userId = req.params.id;
    // Get all orders for the specified user, with status and items
    const sql = `
        SELECT o.orderinfo_id, o.date_placed, o.date_shipped, o.status, 
               i.item_id, i.description AS item_name, i.image, ol.quantity
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

exports.updateOrderStatus = (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (status === 'processing') {
        // Start transaction
        connection.beginTransaction(err => {
            if (err) {
                return res.status(500).json({ error: 'Transaction error', details: err });
            }
            // Get order items and quantities
            const getOrderItemsSql = 'SELECT item_id, quantity FROM orderline WHERE orderinfo_id = ?';
            connection.execute(getOrderItemsSql, [orderId], (err, items) => {
                if (err) {
                    return connection.rollback(() => {
                        res.status(500).json({ error: 'Error fetching order items', details: err });
                    });
                }
                // Update stock for each item
                let errorOccurred = false;
                let completed = 0;
                items.forEach(item => {
                    const updateStockSql = 'UPDATE item SET stock = stock - ? WHERE item_id = ? AND stock >= ?';
                    connection.execute(updateStockSql, [item.quantity, item.item_id, item.quantity], (err, result) => {
                        if (err || result.affectedRows === 0) {
                            errorOccurred = true;
                            return connection.rollback(() => {
                                res.status(400).json({ error: 'Insufficient stock for item', item_id: item.item_id });
                            });
                        }
                        completed++;
                        if (completed === items.length && !errorOccurred) {
                            // Update order status
                            const updateStatusSql = 'UPDATE orderinfo SET status = ? WHERE orderinfo_id = ?';
                            connection.execute(updateStatusSql, [status, orderId], (err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        res.status(500).json({ error: 'Error updating order status', details: err });
                                    });
                                }
                                connection.commit(err => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            res.status(500).json({ error: 'Commit error', details: err });
                                        });
                                    }
                                    res.status(200).json({ success: true });
                                });
                            });
                        }
                    });
                });
            });
        });
    } else if (status === 'Delivered') {
        const sql = 'UPDATE orderinfo SET status = ?, date_shipped = ? WHERE orderinfo_id = ?';
        const values = [status, new Date(), orderId];
        connection.execute(sql, values, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error updating status', details: err });
            }
            return res.status(200).json({ success: true });
        });
    } else {
        const sql = 'UPDATE orderinfo SET status = ? WHERE orderinfo_id = ?';
        const values = [status, orderId];
        connection.execute(sql, values, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error updating status', details: err });
            }
            return res.status(200).json({ success: true });
        });
    }
};

exports.cancelOrder = (req, res) => {
    const userId = req.user.id;
    const orderId = req.params.orderId;

    // Check if order belongs to user and is pending
    const checkSql = `
        SELECT o.status FROM orderinfo o
        INNER JOIN customer c ON o.customer_id = c.customer_id
        INNER JOIN users u ON c.user_id = u.id
        WHERE o.orderinfo_id = ? AND u.id = ?
    `;

    connection.execute(checkSql, [orderId, userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error', details: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Order not found or does not belong to user' });
        }
        const status = results[0].status;
        if (status.toLowerCase() !== 'pending') {
            return res.status(400).json({ error: 'Only pending orders can be cancelled' });
        }

        // Update order status to cancelled
        const updateSql = 'UPDATE orderinfo SET status = ? WHERE orderinfo_id = ?';
        connection.execute(updateSql, ['Cancelled', orderId], (err2) => {
            if (err2) {
                return res.status(500).json({ error: 'Error cancelling order', details: err2 });
            }
            return res.status(200).json({ success: true, message: 'Order cancelled successfully' });
        });
    });
};

exports.getOrderDetailsForUser = (req, res) => {
    const userId = req.user.id;
    const orderId = req.params.orderId;
    const sql = `
    SELECT o.orderinfo_id, o.date_placed, o.date_shipped, o.status, 
           i.item_id, i.description AS item_name, i.image, i.sell_price, ol.quantity
    FROM orderinfo o
    INNER JOIN customer c ON o.customer_id = c.customer_id
    INNER JOIN users u ON c.user_id = u.id
    INNER JOIN orderline ol ON o.orderinfo_id = ol.orderinfo_id
    INNER JOIN item i ON ol.item_id = i.item_id
    WHERE u.id = ? AND o.orderinfo_id = ?
`;
    connection.execute(sql, [userId, orderId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching order details', details: err });
        }
        if (!results || results.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        // Group items for the order
        const order = {
            orderinfo_id: results[0].orderinfo_id,
            date_placed: results[0].date_placed,
            date_shipped: results[0].date_shipped,
            status: results[0].status,
            items: results.map(row => ({
                item_id: row.item_id,
                name: row.item_name,
                image: row.image,
                quantity: row.quantity,
                sell_price: row.sell_price
            }))
        };
        return res.status(200).json({
            success: true,
            order
        });
    });
};

