const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const processImage = async (buffer, originalName) => {
  try {
    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    
    // Generate unique filename
    const extension = originalName.split('.').pop().toLowerCase();
    const filename = `${uuidv4()}.${extension}`;
    const thumbnailFilename = `thumb_${filename}`;

    // Process main image (compress and resize if needed)
    let processedBuffer = buffer;
    if (metadata.width > 2048 || metadata.height > 2048) {
      processedBuffer = await sharp(buffer)
        .resize(2048, 2048, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    // Create thumbnail
    const thumbnailBuffer = await sharp(buffer)
      .resize(300, 300, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    return {
      filename,
      thumbnailFilename,
      processedBuffer,
      thumbnailBuffer,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        size: processedBuffer.length
      }
    };

  } catch (error) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

module.exports = {
  processImage
};