const app = require('./app');
const http = require('http');

const PORT = process.env.PORT || 3006;

const server = http.createServer(app);

// Setup WebSocket for real-time dashboard
app.setupWebSocket(server);

server.listen(PORT, () => {
  console.log(`Admin service running on port ${PORT}`);
  console.log(`WebSocket dashboard available for real-time updates`);
});