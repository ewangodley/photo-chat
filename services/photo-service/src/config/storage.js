const { Client } = require('minio');

const parseEndpoint = (endpoint) => {
  if (!endpoint) return 'localhost';
  return endpoint.replace(/^https?:\/\//, '').split(':')[0];
};

const minioClient = new Client({
  endPoint: parseEndpoint(process.env.S3_ENDPOINT),
  port: 9000,
  useSSL: false,
  accessKey: process.env.S3_ACCESS_KEY,
  secretKey: process.env.S3_SECRET_KEY
});

const initializeBucket = async () => {
  try {
    const bucketExists = await minioClient.bucketExists(process.env.S3_BUCKET);
    if (!bucketExists) {
      await minioClient.makeBucket(process.env.S3_BUCKET, process.env.S3_REGION);
      console.log(`Bucket ${process.env.S3_BUCKET} created successfully`);
    }
  } catch (error) {
    console.error('Error initializing bucket:', error);
  }
};

const uploadFile = async (filename, buffer, metadata) => {
  try {
    await minioClient.putObject(
      process.env.S3_BUCKET,
      filename,
      buffer,
      buffer.length,
      metadata
    );
    
    return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${filename}`;
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
};

const deleteFile = async (filename) => {
  try {
    await minioClient.removeObject(process.env.S3_BUCKET, filename);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

module.exports = {
  minioClient,
  initializeBucket,
  uploadFile,
  deleteFile
};