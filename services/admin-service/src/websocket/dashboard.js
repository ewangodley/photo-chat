const socketIo = require('socket.io');

class DashboardWebSocket {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.setupEventHandlers();
    this.startRealTimeUpdates();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Admin dashboard connected:', socket.id);
      
      socket.on('subscribe_dashboard', () => {
        socket.join('dashboard');
        console.log('Client subscribed to dashboard updates');
      });
      
      socket.on('disconnect', () => {
        console.log('Admin dashboard disconnected:', socket.id);
      });
    });
  }

  startRealTimeUpdates() {
    // Send updates every 5 seconds
    setInterval(() => {
      const realtimeData = {
        timestamp: new Date().toISOString(),
        activeUsers: Math.floor(Math.random() * 100) + 50,
        totalPhotos: Math.floor(Math.random() * 1000) + 500,
        pendingReports: Math.floor(Math.random() * 10),
        systemLoad: Math.random() * 100,
        memoryUsage: Math.random() * 80 + 20,
        newRegistrations: Math.floor(Math.random() * 5),
        photosUploaded: Math.floor(Math.random() * 10)
      };
      
      this.io.to('dashboard').emit('dashboard_update', realtimeData);
    }, 5000);
  }

  broadcastAlert(alert) {
    this.io.to('dashboard').emit('dashboard_alert', {
      type: alert.type || 'info',
      message: alert.message,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = DashboardWebSocket;