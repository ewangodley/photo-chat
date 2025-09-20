const express = require('express');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Apply authentication to all dashboard routes
router.use(auth);

// Real-time dashboard updates endpoint
router.get('/realtime', async (req, res) => {
  try {
    const stats = {
      timestamp: new Date().toISOString(),
      activeUsers: Math.floor(Math.random() * 100) + 50,
      totalPhotos: Math.floor(Math.random() * 1000) + 500,
      pendingReports: Math.floor(Math.random() * 10),
      systemLoad: Math.random() * 100,
      memoryUsage: Math.random() * 80 + 20
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'REALTIME_ERROR',
        message: 'Failed to fetch real-time data'
      }
    });
  }
});

// Advanced analytics charts data
router.get('/charts/users', async (req, res) => {
  try {
    const days = 7;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        registrations: Math.floor(Math.random() * 20) + 5,
        activeUsers: Math.floor(Math.random() * 100) + 30
      });
    }
    
    res.json({
      success: true,
      data: {
        title: 'User Analytics',
        type: 'line',
        datasets: [
          {
            label: 'New Registrations',
            data: data.map(d => ({ x: d.date, y: d.registrations }))
          },
          {
            label: 'Active Users',
            data: data.map(d => ({ x: d.date, y: d.activeUsers }))
          }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CHART_ERROR',
        message: 'Failed to generate user charts'
      }
    });
  }
});

router.get('/charts/photos', async (req, res) => {
  try {
    const data = [
      { category: 'Approved', count: Math.floor(Math.random() * 500) + 200 },
      { category: 'Pending', count: Math.floor(Math.random() * 50) + 10 },
      { category: 'Rejected', count: Math.floor(Math.random() * 100) + 20 }
    ];
    
    res.json({
      success: true,
      data: {
        title: 'Photo Moderation Status',
        type: 'pie',
        datasets: [{
          data: data.map(d => d.count),
          labels: data.map(d => d.category),
          backgroundColor: ['#4CAF50', '#FF9800', '#F44336']
        }]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CHART_ERROR',
        message: 'Failed to generate photo charts'
      }
    });
  }
});

router.get('/charts/reports', async (req, res) => {
  try {
    const hours = 24;
    const data = [];
    
    for (let i = hours - 1; i >= 0; i--) {
      const time = new Date();
      time.setHours(time.getHours() - i);
      data.push({
        hour: time.getHours(),
        reports: Math.floor(Math.random() * 5)
      });
    }
    
    res.json({
      success: true,
      data: {
        title: 'Reports Over Time (24h)',
        type: 'bar',
        datasets: [{
          label: 'Reports',
          data: data.map(d => ({ x: d.hour, y: d.reports })),
          backgroundColor: '#2196F3'
        }]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CHART_ERROR',
        message: 'Failed to generate report charts'
      }
    });
  }
});

module.exports = router;