const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/validate');

// Verifies the JWT and attaches { id, role } to req.user
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return sendError(res, 401, 'Missing or invalid token');
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    return sendError(res, 401, 'Missing or invalid token');
  }
}

function staffOnly(req, res, next) {
  if (!req.user || (req.user.role !== 'staff' && req.user.role !== 'admin')) {
    return sendError(res, 403, 'Access denied: staff or admin only');
  }
  next();
}

function donorOnly(req, res, next) {
  if (!req.user || req.user.role !== 'donor') {
    return sendError(res, 403, 'Access denied: donors only');
  }
  next();
}

module.exports = { auth, staffOnly, donorOnly };