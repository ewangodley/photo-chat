const TestHelpers = require('../utils/test-helpers');
const config = require('../utils/test-config');
const io = require('socket.io-client');

class WebSocketDashboardTests {
  constructor() {
    this.helpers = new TestHelpers(config);
    this.testResults = [];
    this.socket = null;
  }

  async runTest(testName, testFn) {
    this.helpers.logTest(testName);
    try {
      await testFn();
      this.helpers.logSuccess(`${testName} - PASSED`);
      this.testResults.push({ name: testName, status: 'PASSED' });
    } catch (error) {
      this.helpers.logError(`${testName} - FAILED: ${error.message}`);
      this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async testWebSocketConnection() {
    await this.runTest('WebSocket Connection', async () => {
      return new Promise((resolve, reject) => {
        this.socket = io('http://localhost:3006', {
          transports: ['websocket']
        });

        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 5000);

        this.socket.on('connect', () => {
          clearTimeout(timeout);
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          reject(new Error(`WebSocket connection failed: ${error.message}`));
        });
      });
    });
  }

  async testDashboardSubscription() {
    await this.runTest('Dashboard Subscription', async () => {
      return new Promise((resolve, reject) => {
        if (!this.socket || !this.socket.connected) {
          reject(new Error('WebSocket not connected'));
          return;
        }

        const timeout = setTimeout(() => {
          reject(new Error('Dashboard subscription timeout'));
        }, 3000);

        // Subscribe to dashboard updates
        this.socket.emit('subscribe_dashboard');
        
        // Wait a moment for subscription to process
        setTimeout(() => {
          clearTimeout(timeout);
          resolve();
        }, 1000);
      });
    });
  }

  async testRealTimeUpdates() {
    await this.runTest('Real-time Updates', async () => {
      return new Promise((resolve, reject) => {
        if (!this.socket || !this.socket.connected) {
          reject(new Error('WebSocket not connected'));
          return;
        }

        const timeout = setTimeout(() => {
          reject(new Error('No real-time updates received'));
        }, 10000);

        this.socket.on('dashboard_update', (data) => {
          clearTimeout(timeout);
          
          if (!data.timestamp) {
            reject(new Error('Missing timestamp in update'));
            return;
          }
          
          if (typeof data.activeUsers !== 'number') {
            reject(new Error('Missing activeUsers in update'));
            return;
          }
          
          if (typeof data.systemLoad !== 'number') {
            reject(new Error('Missing systemLoad in update'));
            return;
          }
          
          resolve();
        });
      });
    });
  }

  async testDashboardEndpoints() {
    await this.runTest('Dashboard Endpoints Available', async () => {
      // Test without authentication to check if endpoints exist
      const endpoints = [
        'http://localhost:3006/admin/dashboard/realtime',
        'http://localhost:3006/admin/dashboard/charts/users',
        'http://localhost:3006/admin/dashboard/charts/photos',
        'http://localhost:3006/admin/dashboard/charts/reports'
      ];

      for (const endpoint of endpoints) {
        const response = await this.helpers.makeRequest('GET', endpoint);
        // Should get 401 (auth required) not 404 (not found)
        if (response.status === 404) {
          throw new Error(`Endpoint not found: ${endpoint}`);
        }
      }
    });
  }

  async cleanup() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Starting WebSocket Dashboard Tests\n', 'blue');
    
    await this.testWebSocketConnection();
    await this.testDashboardSubscription();
    await this.testRealTimeUpdates();
    await this.testDashboardEndpoints();

    await this.cleanup();

    return this.testResults;
  }
}

module.exports = WebSocketDashboardTests;