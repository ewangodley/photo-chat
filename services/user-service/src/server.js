const app = require('./app');

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});