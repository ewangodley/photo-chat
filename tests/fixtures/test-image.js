const sharp = require('sharp');

class TestImageGenerator {
  static async createJpeg(width = 100, height = 100, color = { r: 255, g: 0, b: 0 }) {
    return await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: color
      }
    })
    .jpeg({ quality: 80 })
    .toBuffer();
  }

  static async createPng(width = 100, height = 100, color = { r: 0, g: 255, b: 0 }) {
    return await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { ...color, alpha: 1 }
      }
    })
    .png()
    .toBuffer();
  }

  static async createWebp(width = 100, height = 100, color = { r: 0, g: 0, b: 255 }) {
    return await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: color
      }
    })
    .webp({ quality: 80 })
    .toBuffer();
  }

  static async createLargeImage(sizeInMB = 15) {
    // Create an image larger than the 10MB limit for testing
    const pixelsNeeded = (sizeInMB * 1024 * 1024) / 3; // 3 bytes per pixel (RGB)
    const dimension = Math.ceil(Math.sqrt(pixelsNeeded));
    
    return await sharp({
      create: {
        width: dimension,
        height: dimension,
        channels: 3,
        background: { r: 128, g: 128, b: 128 }
      }
    })
    .jpeg({ quality: 100 })
    .toBuffer();
  }

  static async createInvalidFile() {
    // Create a text file disguised as an image
    return Buffer.from('This is not an image file', 'utf8');
  }
}

module.exports = TestImageGenerator;