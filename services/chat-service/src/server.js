const { server } = require('./app');

const PORT = process.env.PORT || 3003;

server.listen(PORT, () => {
  console.log(`Chat service with WebSocket running on port ${PORT}`);
});