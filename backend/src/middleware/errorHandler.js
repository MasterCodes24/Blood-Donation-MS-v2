const { sendError } = require('../utils/validate');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function notFound(req, res) {
  return sendError(res, 404, 'Route not found');
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err && err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'Invalid JSON in request body');
  }
  // Log only a short message on the server; never send details to the client
  console.error('Server error:', err && err.message);
  return sendError(res, 500, 'Internal server error');
}

module.exports = { asyncHandler, notFound, errorHandler };