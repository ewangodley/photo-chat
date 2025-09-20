const apiKeyAuth = (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  const validApiKey = process.env.API_KEY;
  
  if (!validApiKey) {
    return next();
  }
  
  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_API_KEY',
        message: 'Invalid or missing API key'
      }
    });
  }
  
  next();
};

module.exports = apiKeyAuth;