const connection = require('../config/database');

exports.getAllItems = (req, res) => {
    const sql = 'SELECT * FROM item i INNER JOIN stock s ON i.item_id = s.item_id';

    try {
        connection.query(sql, (err, rows, fields) => {
            if (err instanceof Error) {
                console.log(err);
                return;
            }
            console.log(rows);
            return res.status(200).json({
                rows,
            })
        });
    } catch (error) {
        console.log(error)
    }
}

exports.getSingleItem = (req, res) => {
    //http://localhost:4000/api/v1/items/id
    const sql = 'SELECT * FROM item i INNER JOIN stock s ON i.item_id = s.item_id WHERE i.item_id = ?'
    const values = [parseInt(req.params.id)];
    try {
        connection.execute(sql, values, (err, result, fields) => {
            if (err instanceof Error) {
                console.log(err);
                return res.status(500).json({ error: 'Error fetching item', details: err });
            }
            // Fetch gallery images
            connection.execute('SELECT image_path FROM product_images WHERE item_id = ?', values, (err2, galleryRows) => {
                if (err2) {
                    console.log(err2);
                    return res.status(500).json({ error: 'Error fetching gallery images', details: err2 });
                }
                return res.status(200).json({
                    success: true,
                    result,
                    images: galleryRows.map(row => row.image_path)
                });
            });
        });
    } catch (error) {
        console.log(error)
    }
}

exports.createItem = (req, res) => {
    console.log("CREATE ITEM ENDPOINT HIT");
    console.log("REQ FILES:", req.files);
    console.log("REQ BODY:", req.body);

    const { description, cost_price, sell_price, quantity } = req.body;
    let imagePath = null;
    // Handle default image
    if (req.files && req.files['image'] && req.files['image'][0]) {
        imagePath = '/images/' + req.files['image'][0].filename;
    }
    // Handle multiple images (gallery)
    const galleryImages = req.files && req.files['images'] ? req.files['images'] : [];
    console.log("Gallery images:", galleryImages.map(f => f.filename));

    if (!description || !cost_price || !sell_price || !quantity) {
        console.log("Missing required fields:", { description, cost_price, sell_price, quantity });
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sql = 'INSERT INTO item (description, cost_price, sell_price, image) VALUES (?, ?, ?, ?)';
    const values = [description, cost_price, sell_price, imagePath];

    connection.execute(sql, values, (err, result) => {
        if (err) {
            console.log("Error inserting item:", err);
            return res.status(500).json({ error: 'Error inserting item', details: err });
        }
        const itemId = result.insertId;
        const stockSql = 'INSERT INTO stock (item_id, quantity) VALUES (?, ?)';
        const stockValues = [itemId, quantity];

        connection.execute(stockSql, stockValues, (err, result) => {
            if (err) {
                console.log("Error inserting stock:", err);
                return res.status(500).json({ error: 'Error inserting stock', details: err });
            }
            // Insert gallery images into product_images table
            galleryImages.forEach(file => {
                connection.execute(
                    'INSERT INTO product_images (item_id, image_path) VALUES (?, ?)',
                    [itemId, '/images/' + file.filename],
                    (err) => { if (err) console.log('Error inserting gallery image:', err); }
                );
            });
            return res.status(201).json({
                success: true,
                itemId,
                image: imagePath,
                quantity,
                galleryImages: galleryImages.map(f => '/images/' + f.filename)
            });
        });
    });
}

exports.updateItem = (req, res) => {
    const id = req.params.id;
    const { description, cost_price, sell_price, quantity } = req.body;
    let imagePath;
    // Handle main image
    if (req.files && req.files['image'] && req.files['image'][0]) {
        imagePath = '/images/' + req.files['image'][0].filename;
        doUpdate();
    } else {
        // Get current image path
        connection.execute('SELECT image FROM item WHERE item_id = ?', [id], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error fetching current image', details: err });
            }
            imagePath = results[0]?.image || null;
            doUpdate();
        });
    }

    function doUpdate() {
        if (!description || !cost_price || !sell_price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Handle gallery images
        const galleryImages = req.files && req.files['images'] ? req.files['images'] : [];
        const sql = 'UPDATE item SET description = ?, cost_price = ?, sell_price = ?, image = ? WHERE item_id = ?';
        const values = [description, cost_price, sell_price, imagePath, id];
        connection.execute(sql, values, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error updating item', details: err });
            }
            const stockSql = 'UPDATE stock SET quantity = ? WHERE item_id = ?';
            const stockValues = [quantity, id];
            connection.execute(stockSql, stockValues, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ error: 'Error updating stock', details: err });
                }
                // Insert new gallery images into product_images table
                galleryImages.forEach(file => {
                    connection.execute(
                        'INSERT INTO product_images (item_id, image_path) VALUES (?, ?)',
                        [id, '/images/' + file.filename],
                        (err) => { if (err) console.log('Error inserting gallery image:', err); }
                    );
                });
                return res.status(201).json({
                    success: true,
                    image: imagePath,
                    quantity,
                    galleryImages: galleryImages.map(f => '/images/' + f.filename)
                });
            });
        });
    }
};

exports.deleteItem = (req, res) => {
    const id = req.params.id;
    // First, delete from stock
    connection.execute('DELETE FROM stock WHERE item_id = ?', [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error deleting stock', details: err });
        }
        // Then, delete from item
        connection.execute('DELETE FROM item WHERE item_id = ?', [id], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error deleting item', details: err });
            }
            return res.status(201).json({
                success: true,
                message: 'item deleted'
            });
        });
    });
};

