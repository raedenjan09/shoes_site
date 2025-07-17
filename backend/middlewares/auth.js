const jwt = require("jsonwebtoken")
const connection = require('../config/database');

exports.isAuthenticatedUser = (req, res, next) => {
    if (!req.header('Authorization')) {
        return res.status(401).json({ message: 'Login first to access this resource' })
    }

    const token = req.header('Authorization').split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Login first to access this resource' })
    }

    // Check if token is in the database and not expired
    connection.execute(
        'SELECT * FROM user_tokens WHERE token = ? AND expires_at > NOW()',
        [token],
        (err, results) => {
            if (err || results.length === 0) {
                return res.status(401).json({ message: 'Token is invalid or expired' });
            }
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET)
                req.user = { id: decoded.id, role: decoded.role } // include role if present
                next()
            } catch (err) {
                return res.status(401).json({ message: 'Invalid token' })
            }
        }
    );
};

exports.isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

