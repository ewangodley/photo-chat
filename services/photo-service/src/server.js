require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const { initializeBucket } = require('./config/storage');

const PORT = process.env.PORT || 3002;

// Initialize services
const initializeServices = async () => {
  await connectDB();
  await initializeBucket();
};

// Start server
initializeServices().then(() => {
  app.listen(PORT, () => {
    console.log(`Photo service running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
}).catch(error => {
  console.error('Failed to initialize services:', error);
  process.exit(1);
});