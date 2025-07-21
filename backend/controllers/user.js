const connection = require('../config/database');
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")

const registerUser = async (req, res) => {
    // Collect all user details
    const { email, password, title, fname, lname, addressline, town, phone, zipcode } = req.body;
    const name = fname + ' ' + lname;
    const hashedPassword = await bcrypt.hash(password, 10);
    // Add role as 'user' by default
    const userSql = 'INSERT INTO users (name, password, email, role) VALUES (?, ?, ?, ?)';
    let imagePath = null;
    if (req.file) {
        // Extract relative path from full path
        const fullPath = req.file.path.replace(/\\/g, "/");
        const baseDir = "backend/images/";
        const index = fullPath.indexOf(baseDir);
        if (index !== -1) {
            imagePath = "/images/" + fullPath.substring(index + baseDir.length);
        } else {
            imagePath = fullPath; // fallback to full path if baseDir not found
        }
    }
    try {
        connection.execute(userSql, [name, hashedPassword, email, 'user'], (err, result) => {
            if (err instanceof Error) {
                console.log(err);
                return res.status(401).json({ error: err });
            }
            const userId = result.insertId;
            // Insert into customer table
            const customerSql = `INSERT INTO customer (title, fname, lname, addressline, town, zipcode, phone, image_path, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const customerParams = [title, fname, lname, addressline, town, zipcode, phone, imagePath, userId];
            connection.execute(customerSql, customerParams, (custErr, custResult) => {
                if (custErr instanceof Error) {
                    console.log(custErr);
                    return res.status(401).json({ error: custErr });
                }
                return res.status(200).json({ success: true, userId });
            });
        });
    } catch (error) {
        console.log(error);
    }
};

const loginUser = async (req, res) => {
    console.log(req.body)
    const { email, password } = req.body;
    // Select role as well
    const sql = 'SELECT id, name, email, password, role, deleted_at FROM users WHERE email = ?';
    connection.execute(sql, [email], async (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error logging in', details: err });
        }
        console.log(results)
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = results[0];

        // Check if user is deactivated
        if (user.deleted_at) {
            return res.status(401).json({ error: 'deactivated', message: 'Your account is deactivated. Please contact support.' });
        }

        const match = await bcrypt.compare(password, user.password);
        console.log(match)
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        delete user.password;

        // Include role in JWT
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
        const createdAt = new Date();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day expiry
        // Save token to user_tokens table
        connection.execute(
          'INSERT INTO user_tokens (user_id, token, created_at, expires_at) VALUES (?, ?, ?, ?)',
          [user.id, token, createdAt, expiresAt],
          (err2) => {
            if (err2) {
              console.log('Error saving token:', err2);
            }
            // Also save token in users table (current_token column)
            connection.execute(
              'UPDATE users SET current_token = ? WHERE id = ?',
              [token, user.id],
              (err3) => {
                if (err3) {
                  console.log('Error updating current_token:', err3);
                }
                return res.status(200).json({
                    success: "welcome back",
                    user: user,
                    token
                });
              }
            );
          }
        );
    });
};

// Token revocation for logout (example function)
const logoutUser = (req, res) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(400).json({ error: 'No token provided' });
    connection.execute('DELETE FROM user_tokens WHERE token = ?', [token], (err) => {
        if (err) return res.status(500).json({ error: 'Error logging out', details: err });
        res.json({ success: true, message: 'Logged out' });
    });
};

const updateUser = (req, res) => {
    const { title, fname, lname, addressline, town, zipcode, phone, userId } = req.body;
    let image = null;
    if (req.file) {
        // Extract relative path from full path
        const fullPath = req.file.path.replace(/\\/g, "/");
        const baseDir = "backend/images/";
        const index = fullPath.indexOf(baseDir);
        if (index !== -1) {
            image = "/images/" + fullPath.substring(index + baseDir.length);
        } else {
            image = fullPath; // fallback to full path if baseDir not found
        }
    }

    // 1. Check if user exists in users table
    const checkUserSql = 'SELECT id FROM users WHERE id = ?';
    connection.execute(checkUserSql, [userId], (err, userRows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (userRows.length === 0) {
            return res.status(400).json({ error: 'User does not exist' });
        }

        // 2. Proceed with customer insert/update
        const userSql = `
            INSERT INTO customer 
                (title, fname, lname, addressline, town, zipcode, phone, image_path, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                title = VALUES(title),
                fname = VALUES(fname),
                lname = VALUES(lname),
                addressline = VALUES(addressline),
                town = VALUES(town),
                zipcode = VALUES(zipcode),
                phone = VALUES(phone),
                image_path = VALUES(image_path)
        `;
        const params = [title, fname, lname, addressline, town, zipcode, phone, image, userId];

        connection.execute(userSql, params, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: err.message });
            }
            return res.status(200).json({ success: true, result });
        });
    });
};

// Update deactivateUser to revoke all tokens for the user
const deactivateUser = (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const sql = 'UPDATE users SET deleted_at = ? WHERE email = ?';
    const timestamp = new Date();

    connection.execute(sql, [timestamp, email], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error deactivating user', details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Revoke all tokens for this user
        connection.execute('SELECT id FROM users WHERE email = ?', [email], (err2, userRows) => {
            if (!err2 && userRows.length > 0) {
                const userId = userRows[0].id;
                connection.execute('DELETE FROM user_tokens WHERE user_id = ?', [userId], () => {});
            }
            return res.status(200).json({
                success: true,
                message: 'User deactivated successfully',
                email,
                deleted_at: timestamp
            });
        });
    });
};

const getUserProfile = (req, res) => {
    const userId = req.user.id; // set by isAuthenticatedUser middleware
    const sql = `
        SELECT u.id, u.name, u.email, c.title, c.fname, c.lname, c.addressline, c.town, c.zipcode, c.phone, c.image_path
        FROM users u
        LEFT JOIN customer c ON u.id = c.user_id
        WHERE u.id = ? AND u.deleted_at IS NULL
    `;
    connection.execute(sql, [userId], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error fetching user profile', details: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({
            success: true,
            user: results[0]
        });
    });
};

const getAllUsers = (req, res) => {
    const sql = 'SELECT id, name, email, role, deleted_at FROM users';
    connection.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching users', details: err });
        }
        return res.status(200).json({ success: true, users: results });
    });
};

const changeUserRole = (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;
    if (!role) {
        return res.status(400).json({ error: 'Role is required' });
    }
    const sql = 'UPDATE users SET role = ? WHERE id = ? AND deleted_at IS NULL';
    connection.execute(sql, [role, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error updating user role', details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({ success: true, message: 'User role updated', userId, role });
    });
};

const deactivateUserById = (req, res) => {
    const userId = req.params.id;
    const sql = 'UPDATE users SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL';
    const timestamp = new Date();
    connection.execute(sql, [timestamp, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error deactivating user', details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({ success: true, message: 'User deactivated', userId, deleted_at: timestamp });
    });
};

const reactivateUserById = (req, res) => {
    const userId = req.params.id;
    const sql = 'UPDATE users SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL';
    connection.execute(sql, [userId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error reactivating user', details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found or already active' });
        }
        return res.status(200).json({ success: true, message: 'User reactivated', userId });
    });
};

// Delete a specific token (manual token revocation)
const deleteToken = (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }
    connection.execute('DELETE FROM user_tokens WHERE token = ?', [token], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error deleting token', details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Token not found' });
        }
        res.json({ success: true, message: 'Token deleted' });
    });
};

module.exports = {
    registerUser,
    loginUser,
    updateUser,
    deactivateUser,
    getUserProfile,
    getAllUsers,
    changeUserRole,
    deactivateUserById,
    reactivateUserById,
    deleteToken,
};