const { v4: uuidv4 } = require('uuid');

const successResponse = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
      version: 'v1'
    }
  });
};

const errorResponse = (res, code, message, details = null, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    }
  });
};

module.exports = {
  successResponse,
  errorResponse
};