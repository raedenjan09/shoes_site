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

    // First verify the JWT token structure and expiry
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id, role: decoded.role };
    } catch (jwtError) {
        if (jwtError.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired. Please login again.' });
        } else if (jwtError.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token. Please login again.' });
        } else {
            return res.status(401).json({ message: 'Token verification failed' });
        }
    }

    // Check if token is in the database and not expired
    connection.execute(
        'SELECT * FROM user_tokens WHERE token = ? AND expires_at > NOW()',
        [token],
        (err, results) => {
            if (err) {
                console.log('Database error checking token:', err);
                return res.status(500).json({ message: 'Authentication error' });
            }
            
            if (results.length === 0) {
                return res.status(401).json({ message: 'Token is invalid or expired. Please login again.' });
            }
            
            // Token is valid, proceed
            next();
        }
    );
};

exports.isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

