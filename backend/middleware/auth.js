const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT secret is not configured on the server' });
    }

    const decoded = jwt.verify(token, secret);
    req.user = { id: decoded.userId || decoded.id, email: decoded.email, role: decoded.role };
    // Backwards compatibility with existing routes expecting req.userId
    req.userId = req.user.id;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = auth;

