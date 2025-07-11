const jwt = require("jsonwebtoken")
exports.isAuthenticatedUser = (req, res, next) => {
    if (!req.header('Authorization')) {
        return res.status(401).json({ message: 'Login first to access this resource' })
    }

    const token = req.header('Authorization').split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Login first to access this resource' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = { id: decoded.id, role: decoded.role } // include role if present
        next()
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' })
    }
};

exports.isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

