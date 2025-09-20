const multer = require('multer');
const { errorResponse } = require('../utils/response');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_MIME_TYPES.split(',');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('UNSUPPORTED_MEDIA_TYPE'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
  }
});

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'FILE_TOO_LARGE', 'File size exceeds 10MB limit', {
        maxSize: parseInt(process.env.MAX_FILE_SIZE),
        receivedSize: req.headers['content-length']
      }, 413);
    }
  } else if (err.message === 'UNSUPPORTED_MEDIA_TYPE') {
    return errorResponse(res, 'UNSUPPORTED_MEDIA_TYPE', 'Only JPEG, PNG, and WebP images are allowed', null, 415);
  }
  
  next(err);
};

module.exports = {
  upload: upload.single('image'),
  handleUploadError
};