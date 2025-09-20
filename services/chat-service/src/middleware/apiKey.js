const apiKeyAuth = (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  const expectedKey = process.env.API_KEY || 'test-api-key-change-in-production';
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_API_KEY',
        message: 'Invalid or missing API key'
      }
    });
  }
  
  if (apiKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_API_KEY',
        message: 'Invalid API key'
      }
    });
  }
  
  next();
};

module.exports = apiKeyAuth;