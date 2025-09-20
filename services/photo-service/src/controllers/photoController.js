const Photo = require('../models/Photo');
const { uploadFile, deleteFile } = require('../config/storage');
const { processImage } = require('../utils/imageProcessor');
const { successResponse, errorResponse } = require('../utils/response');

const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'FILE_MISSING', 'Image file required', null, 400);
    }

    const { latitude, longitude, caption, isPublic = true } = req.body;

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return errorResponse(res, 'INVALID_COORDINATES', 'Invalid latitude or longitude', null, 400);
    }

    // Process image
    const {
      filename,
      thumbnailFilename,
      processedBuffer,
      thumbnailBuffer,
      metadata
    } = await processImage(req.file.buffer, req.file.originalname);

    // Upload to storage
    const imageUrl = await uploadFile(filename, processedBuffer, {
      'Content-Type': req.file.mimetype
    });
    
    const thumbnailUrl = await uploadFile(thumbnailFilename, thumbnailBuffer, {
      'Content-Type': 'image/jpeg'
    });

    // Save to database
    const photo = new Photo({
      userId: req.user.id,
      filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: metadata.size,
      width: metadata.width,
      height: metadata.height,
      location: {
        type: 'Point',
        coordinates: [lng, lat] // GeoJSON format: [longitude, latitude]
      },
      caption: caption || null,
      isPublic: isPublic === 'true' || isPublic === true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    await photo.save();

    const responseData = {
      photo: {
        id: photo._id,
        url: imageUrl,
        thumbnailUrl,
        location: {
          latitude: lat,
          longitude: lng
        },
        caption: photo.caption,
        isPublic: photo.isPublic,
        uploadedAt: photo.uploadedAt,
        expiresAt: photo.expiresAt
      }
    };

    return successResponse(res, responseData, 201);

  } catch (error) {
    console.error('Photo upload error:', error);
    return errorResponse(res, 'UPLOAD_FAILED', 'Photo upload failed', null, 500);
  }
};

const getNearbyPhotos = async (req, res) => {
  try {
    const { latitude, longitude, radius = 1000, limit = 20, offset = 0, sort = 'distance' } = req.query;

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusMeters = parseInt(radius);
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const offsetNum = parseInt(offset) || 0;

    if (isNaN(lat) || isNaN(lng)) {
      return errorResponse(res, 'INVALID_COORDINATES', 'Valid latitude and longitude required', null, 400);
    }

    if (radiusMeters > 50000) {
      return errorResponse(res, 'RADIUS_TOO_LARGE', 'Maximum radius is 50km', null, 400);
    }

    // Build aggregation pipeline
    const pipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          distanceField: 'distance',
          maxDistance: radiusMeters,
          spherical: true,
          query: {
            isPublic: true,
            moderationStatus: 'approved'
          }
        }
      },
      {
        $lookup: {
          from: 'users', // Assuming we can access user data
          localField: 'userId',
          foreignField: '_id',
          as: 'uploader',
          pipeline: [{ $project: { username: 1 } }]
        }
      },
      {
        $project: {
          _id: 1,
          filename: 1,
          location: 1,
          caption: 1,
          uploadedAt: 1,
          distance: 1,
          uploader: { $arrayElemAt: ['$uploader', 0] }
        }
      }
    ];

    // Add sorting
    if (sort === 'recent') {
      pipeline.push({ $sort: { uploadedAt: -1 } });
    } else if (sort === 'popular') {
      pipeline.push({ $sort: { viewCount: -1 } });
    }
    // Default sort by distance (already sorted by $geoNear)

    // Add pagination
    pipeline.push({ $skip: offsetNum });
    pipeline.push({ $limit: limitNum });

    const photos = await Photo.aggregate(pipeline);

    // Get total count for pagination
    const totalPipeline = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distance',
          maxDistance: radiusMeters,
          spherical: true,
          query: { isPublic: true, moderationStatus: 'approved' }
        }
      },
      { $count: 'total' }
    ];

    const totalResult = await Photo.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    // Format response
    const formattedPhotos = photos.map(photo => ({
      id: photo._id,
      url: `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${photo.filename}`,
      thumbnailUrl: `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/thumb_${photo.filename}`,
      location: {
        latitude: photo.location.coordinates[1],
        longitude: photo.location.coordinates[0]
      },
      caption: photo.caption,
      uploadedAt: photo.uploadedAt,
      distance: Math.round(photo.distance),
      uploader: {
        id: photo.uploader?._id,
        username: photo.uploader?.username
      }
    }));

    return successResponse(res, {
      photos: formattedPhotos,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < total
      }
    });

  } catch (error) {
    console.error('Get nearby photos error:', error);
    return errorResponse(res, 'QUERY_FAILED', 'Failed to retrieve photos', null, 500);
  }
};

const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    
    const photo = await Photo.findById(id);
    
    if (!photo) {
      return errorResponse(res, 'PHOTO_NOT_FOUND', 'Photo not found or already deleted', null, 404);
    }

    // Check ownership
    if (photo.userId.toString() !== req.user.id) {
      return errorResponse(res, 'FORBIDDEN', 'You can only delete your own photos', null, 403);
    }

    // Delete from storage
    await deleteFile(photo.filename);
    await deleteFile(`thumb_${photo.filename}`);

    // Delete from database
    await Photo.findByIdAndDelete(id);

    return successResponse(res, {
      message: 'Photo deleted successfully'
    });

  } catch (error) {
    console.error('Delete photo error:', error);
    return errorResponse(res, 'DELETE_FAILED', 'Failed to delete photo', null, 500);
  }
};

const getUserPhotos = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const offsetNum = parseInt(offset) || 0;

    const photos = await Photo.find({ userId: req.user.id })
      .sort({ uploadedAt: -1 })
      .limit(limitNum)
      .skip(offsetNum)
      .select('-__v');

    const total = await Photo.countDocuments({ userId: req.user.id });

    const formattedPhotos = photos.map(photo => ({
      id: photo._id,
      url: `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${photo.filename}`,
      thumbnailUrl: `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/thumb_${photo.filename}`,
      location: {
        latitude: photo.location.coordinates[1],
        longitude: photo.location.coordinates[0]
      },
      caption: photo.caption,
      isPublic: photo.isPublic,
      uploadedAt: photo.uploadedAt,
      expiresAt: photo.expiresAt
    }));

    return successResponse(res, {
      photos: formattedPhotos,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < total
      }
    });

  } catch (error) {
    console.error('Get user photos error:', error);
    return errorResponse(res, 'QUERY_FAILED', 'Failed to retrieve photos', null, 500);
  }
};

module.exports = {
  uploadPhoto,
  getNearbyPhotos,
  deletePhoto,
  getUserPhotos
};