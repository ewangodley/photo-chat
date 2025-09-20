const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return errorResponse(res, 'TOKEN_MISSING', 'Access token required', null, 401);
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 'TOKEN_INVALID', 'Invalid or expired token', null, 403);
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'UNAUTHORIZED', 'Authentication required', null, 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'INSUFFICIENT_PERMISSIONS', 'Insufficient permissions', null, 403);
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
};