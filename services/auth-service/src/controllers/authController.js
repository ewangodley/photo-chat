const User = require('../models/User');
const Session = require('../models/Session');
const { generateTokens, verifyToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      const field = existingUser.username === username ? 'username' : 'email';
      return errorResponse(res, 'VALIDATION_ERROR', 'User already exists', {
        [field]: [`${field.charAt(0).toUpperCase() + field.slice(1)} already exists`]
      }, 400);
    }

    // Create new user
    const user = new User({
      username,
      email,
      passwordHash: password // Will be hashed by pre-save middleware
    });

    await user.save();

    // Generate tokens
    const tokens = generateTokens(user);

    // Create session
    const session = new Session({
      userId: user._id,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      deviceInfo: req.headers['user-agent'],
      ipAddress: req.ip
    });

    await session.save();

    // Return user data without password
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    };

    return successResponse(res, {
      user: userData,
      tokens
    }, 201);

  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'Registration failed', null, 500);
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier }
      ],
      isActive: true
    });

    if (!user || !(await user.comparePassword(password))) {
      return errorResponse(res, 'INVALID_CREDENTIALS', 'Invalid username or password', null, 401);
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const tokens = generateTokens(user);

    // Create session
    const session = new Session({
      userId: user._id,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deviceInfo: req.headers['user-agent'],
      ipAddress: req.ip
    });

    await session.save();

    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      lastLoginAt: user.lastLoginAt
    };

    return successResponse(res, {
      user: userData,
      tokens
    });

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'Login failed', null, 500);
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 'TOKEN_MISSING', 'Refresh token required', null, 401);
    }

    // Find session with refresh token
    const session = await Session.findOne({ refreshToken }).populate('userId');

    if (!session || session.expiresAt < new Date()) {
      return errorResponse(res, 'TOKEN_INVALID', 'Invalid or expired refresh token', null, 403);
    }

    // Generate new tokens
    const tokens = generateTokens(session.userId);

    // Update session
    session.token = tokens.accessToken;
    session.refreshToken = tokens.refreshToken;
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await session.save();

    return successResponse(res, { tokens });

  } catch (error) {
    console.error('Token refresh error:', error);
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'Token refresh failed', null, 500);
  }
};

const verifyTokenEndpoint = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return errorResponse(res, 'TOKEN_MISSING', 'Token required', null, 400);
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user || !user.isActive) {
      return errorResponse(res, 'TOKEN_INVALID', 'Invalid token or user not found', null, 403);
    }

    return successResponse(res, {
      valid: true,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      },
      permissions: [user.role]
    });

  } catch (error) {
    return errorResponse(res, 'TOKEN_INVALID', 'Invalid token', null, 403);
  }
};

const logout = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      await Session.deleteOne({ token });
    }

    return successResponse(res, { message: 'Logged out successfully' });

  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'Logout failed', null, 500);
  }
};

module.exports = {
  register,
  login,
  refresh,
  verifyTokenEndpoint,
  logout
};