const jwt = require('jsonwebtoken');

class AuthController {
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // Mock admin credentials - in production, query user service or admin database
      const adminUsers = {
        'admin': { id: 'admin1', password: 'admin123', role: 'admin' },
        'moderator': { id: 'mod1', password: 'mod123', role: 'moderator' }
      };

      const user = adminUsers[username];
      if (!user || user.password !== password) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid username or password'
          }
        });
      }

      // Generate admin token
      const token = jwt.sign(
        { 
          id: user.id, 
          username, 
          role: user.role,
          type: 'admin'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '8h' }
      );

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: 'Admin login failed'
        }
      });
    }
  }

  async logout(req, res) {
    res.json({
      success: true,
      data: { message: 'Logged out successfully' }
    });
  }
}

module.exports = new AuthController();