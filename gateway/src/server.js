require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log('Service endpoints:');
  console.log(`  Auth: ${process.env.AUTH_SERVICE_URL}`);
  console.log(`  Photos: ${process.env.PHOTO_SERVICE_URL}`);
  console.log(`  Chat: ${process.env.CHAT_SERVICE_URL}`);
  console.log(`  Users: ${process.env.USER_SERVICE_URL}`);
  console.log(`  Notifications: ${process.env.NOTIFICATION_SERVICE_URL}`);
  console.log(`  Admin: ${process.env.ADMIN_SERVICE_URL}`);
});