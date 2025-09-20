const AWS = require('aws-sdk');

// Configure S3 client for MinIO
const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT || 'http://minio:9000',
  accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
  secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  region: process.env.S3_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.S3_BUCKET || 'photos';

const deleteFromS3 = async (key) => {
  try {
    await s3.deleteObject({
      Bucket: BUCKET_NAME,
      Key: key
    }).promise();
    console.log(`Deleted S3 object: ${key}`);
  } catch (error) {
    console.error(`Failed to delete S3 object ${key}:`, error.message);
    throw error;
  }
};

const uploadToS3 = async (buffer, key, contentType) => {
  try {
    const result = await s3.upload({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType
    }).promise();
    return result.Location;
  } catch (error) {
    console.error(`Failed to upload to S3:`, error.message);
    throw error;
  }
};

module.exports = {
  deleteFromS3,
  uploadToS3,
  s3
};