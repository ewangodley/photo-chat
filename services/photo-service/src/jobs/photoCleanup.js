const Photo = require('../models/Photo');
const { deleteFromS3 } = require('../utils/s3');

class PhotoCleanupJob {
  constructor() {
    this.isRunning = false;
  }

  async cleanupExpiredPhotos() {
    if (this.isRunning) {
      console.log('Photo cleanup already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('Starting photo cleanup job...');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const expiredPhotos = await Photo.find({
        uploadedAt: { $lt: thirtyDaysAgo }
      });

      console.log(`Found ${expiredPhotos.length} expired photos to delete`);

      for (const photo of expiredPhotos) {
        try {
          // Delete from S3
          await deleteFromS3(photo.s3Key);
          
          // Delete from database
          await Photo.findByIdAndDelete(photo._id);
          
          console.log(`Deleted expired photo: ${photo._id}`);
        } catch (error) {
          console.error(`Failed to delete photo ${photo._id}:`, error.message);
        }
      }

      console.log(`Photo cleanup completed. Deleted ${expiredPhotos.length} photos`);
    } catch (error) {
      console.error('Photo cleanup job failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  start() {
    // Run immediately
    this.cleanupExpiredPhotos();
    
    // Run every 24 hours
    setInterval(() => {
      this.cleanupExpiredPhotos();
    }, 24 * 60 * 60 * 1000);
    
    console.log('Photo cleanup job scheduled to run every 24 hours');
  }
}

module.exports = new PhotoCleanupJob();