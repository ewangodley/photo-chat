const axios = require('axios');
const { errorResponse } = require('../utils/response');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return errorResponse(res, 'TOKEN_MISSING', 'Access token required', null, 401);
    }

    // Verify token with auth service
    const response = await axios.post(`${process.env.AUTH_SERVICE_URL}/auth/verify-token`, {
      token
    });

    if (response.data.success && response.data.data.valid) {
      req.user = response.data.data.user;
      next();
    } else {
      return errorResponse(res, 'TOKEN_INVALID', 'Invalid token', null, 403);
    }

  } catch (error) {
    console.error('Token verification error:', error.message);
    return errorResponse(res, 'TOKEN_INVALID', 'Invalid or expired token', null, 403);
  }
};

module.exports = {
  authenticateToken
};