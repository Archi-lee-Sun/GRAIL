const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const error = new Error('No token provided or invalid format');
        error.status = 401;
        next(error);
        return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        const error = new Error('Invalid token format');
        error.status = 401;
        next(error);
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.userId };
        next();
    } catch (err) {
        const error = new Error('Invalid or expired token');
        error.status = 401;
        next(error);
    }
};

module.exports = auth;