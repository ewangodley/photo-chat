const express = require('express');
const multer = require('multer');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Mock photos data
const photos = [];

// GET /api/photos
router.get('/', (req, res) => {
  res.json(photos);
});

// POST /api/photos/upload
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    const { latitude, longitude, caption } = req.body;
    
    const photo = {
      id: Date.now().toString(),
      userId: '1', // Mock user ID
      imageUrl: `/uploads/${req.file.filename}`,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      caption,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };
    
    photos.push(photo);
    
    res.json({ photo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/photos/:id
router.delete('/:id', (req, res) => {
  const photoId = req.params.id;
  const index = photos.findIndex(p => p.id === photoId);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Photo not found' });
  }
  
  photos.splice(index, 1);
  res.json({ message: 'Photo deleted' });
});

module.exports = router;