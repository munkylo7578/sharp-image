const sharp = require('sharp');
const R2Service = require('./r2Service');
const Database = require('../db/database');

class ImageService {
  constructor() {
    this.r2Service = new R2Service();
    this.db = new Database();
  }

  async initialize() {
    await this.db.connect();
  }

  async getResizedImage(imageName, width, height) {
    try {
      // Step 1: Find image in database
      const imageRecord = await this.db.getImageByName(imageName);
      
      if (!imageRecord) {
        throw new Error(`Image with name "${imageName}" not found in database`);
      }

      // Step 2: Get image from Cloudflare R2
      const imageBuffer = await this.r2Service.getImage(imageRecord.url);

      // Step 3: Resize image using Sharp
      const resizeOptions = {};
      
      if (width && height) {
        resizeOptions.width = parseInt(width);
        resizeOptions.height = parseInt(height);
        resizeOptions.fit = 'cover'; // or 'contain', 'fill', 'inside', 'outside'
      } else if (width) {
        resizeOptions.width = parseInt(width);
      } else if (height) {
        resizeOptions.height = parseInt(height);
      }

      // Detect image format
      const metadata = await sharp(imageBuffer).metadata();
      const format = metadata.format || 'jpeg';

      let resizedBuffer;
      if (Object.keys(resizeOptions).length > 0) {
        resizedBuffer = await sharp(imageBuffer)
          .resize(resizeOptions)
          .toFormat(format)
          .toBuffer();
      } else {
        // No resize parameters, return original
        resizedBuffer = imageBuffer;
      }

      // Map format to MIME type
      const mimeTypes = {
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        gif: 'image/gif',
        avif: 'image/avif',
        tiff: 'image/tiff',
        svg: 'image/svg+xml',
      };

      return {
        buffer: resizedBuffer,
        format: mimeTypes[format] || 'image/jpeg',
      };
    } catch (error) {
      throw error;
    }
  }
  async listImages(page = 1, pageSize = 10) {
    try{
      const images = await this.db.getImages(page, pageSize);
      return images;
    } catch (error) {
      throw new Error(`Failed to list images: ${error.message}`);
    }
  }
  async close() {
    await this.db.close();
  }
}

module.exports = ImageService;

