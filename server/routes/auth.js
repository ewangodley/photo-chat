const express = require('express');
const router = express.Router();

// Mock user data (replace with database)
const users = [];

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Mock registration logic
    const user = {
      id: Date.now().toString(),
      username,
      email,
      createdAt: new Date().toISOString()
    };
    
    users.push({ ...user, password });
    
    const token = 'mock_jwt_token_' + user.id;
    
    res.json({
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Mock login logic
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = 'mock_jwt_token_' + user.id;
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;