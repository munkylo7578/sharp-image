const { S3Client, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require('dotenv').config();

class R2Service {
  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = process.env.R2_BUCKET_NAME;
  }

  async getImage(key) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.client.send(command);
      
      // Convert stream to buffer
      const chunks = [];
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }
      
      return Buffer.concat(chunks);
    } catch (error) {
      throw new Error(`Failed to fetch image from R2: ${error.message}`);
    }
  }

  async listObjects(prefix = '') {
    try {
      const objects = [];
      let continuationToken = undefined;

      do {
        const command = new ListObjectsV2Command({
          Bucket: this.bucketName,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        });

        const response = await this.client.send(command);
        
        if (response.Contents) {
          objects.push(...response.Contents);
        }

        continuationToken = response.NextContinuationToken;
      } while (continuationToken);

      return objects;
    } catch (error) {
      throw new Error(`Failed to list objects from R2: ${error.message}`);
    }
  }
}

module.exports = R2Service;

