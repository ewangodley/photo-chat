const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const UserProfile = require('../models/UserProfile');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure S3 client
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || 'http://minio:9000',
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin'
  },
  forcePathStyle: true
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload profile picture
router.post('/upload', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No profile picture file provided'
        }
      });
    }

    // Process image with sharp
    const processedImage = await sharp(req.file.buffer)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Generate unique filename
    const filename = `profile-pictures/${req.user.userId}-${Date.now()}.jpg`;

    // Upload to S3
    const uploadParams = {
      Bucket: process.env.S3_BUCKET || 'phone-app-storage',
      Key: filename,
      Body: processedImage,
      ContentType: 'image/jpeg'
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Update user profile with new picture URL
    let userProfile = await UserProfile.findOne({ userId: req.user.userId });
    if (!userProfile) {
      userProfile = new UserProfile({ userId: req.user.userId });
    }

    // Delete old profile picture if exists
    if (userProfile.profilePicture) {
      try {
        const oldKey = userProfile.profilePicture.split('/').pop();
        await s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET || 'phone-app-storage',
          Key: `profile-pictures/${oldKey}`
        }));
      } catch (error) {
        console.log('Failed to delete old profile picture:', error.message);
      }
    }

    // Update user with new profile picture URL
    userProfile.profilePicture = `${process.env.S3_PUBLIC_URL || 'http://localhost:9000/phone-app-storage'}/${filename}`;
    await userProfile.save();

    res.json({
      success: true,
      data: {
        profilePicture: userProfile.profilePicture,
        message: 'Profile picture uploaded successfully'
      }
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: 'Failed to upload profile picture'
      }
    });
  }
});

// Delete profile picture
router.delete('/delete', auth, async (req, res) => {
  try {
    const userProfile = await UserProfile.findOne({ userId: req.user.userId });
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_PROFILE_NOT_FOUND',
          message: 'User profile not found'
        }
      });
    }

    if (!userProfile.profilePicture) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_PROFILE_PICTURE',
          message: 'No profile picture to delete'
        }
      });
    }

    // Delete from S3
    try {
      const key = userProfile.profilePicture.split('/').pop();
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET || 'phone-app-storage',
        Key: `profile-pictures/${key}`
      }));
    } catch (error) {
      console.log('Failed to delete from S3:', error.message);
    }

    // Remove from user profile
    userProfile.profilePicture = null;
    await userProfile.save();

    res.json({
      success: true,
      data: {
        message: 'Profile picture deleted successfully'
      }
    });

  } catch (error) {
    console.error('Profile picture delete error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete profile picture'
      }
    });
  }
});

module.exports = router;