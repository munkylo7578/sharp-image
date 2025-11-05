const express = require('express');
const ImageService = require('./services/imageService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const imageService = new ImageService();

// Initialize database connection
imageService.initialize().catch((err) => {
  console.error('Failed to initialize image service:', err);
  process.exit(1);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Image service is running' });
});

// Main image endpoint
app.get('/image/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { width, height } = req.query;

    if (!name) {
      return res.status(400).json({ error: 'Image name is required' });
    }

    // Get resized image
    const { buffer, format } = await imageService.getResizedImage(name, width, height);

    // Set appropriate headers
    res.set({
      'Content-Type': format,
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
    });

    // Send image buffer
    res.send(buffer);
  } catch (error) {
    console.error('Error processing image request:', error);
    res.status(404).json({ error: error.message });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await imageService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await imageService.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Image service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Image endpoint: http://localhost:${PORT}/image/:name?width=800&height=600`);
});

