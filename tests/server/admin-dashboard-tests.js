const TestHelpers = require('../utils/test-helpers');
const config = require('../utils/test-config');

class AdminDashboardTests {
  constructor() {
    this.helpers = new TestHelpers(config);
    this.testResults = [];
    this.adminUser = null;
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

  async setupAdminUser() {
    const loginResponse = await this.helpers.makeRequest(
      'POST',
      'http://localhost:3006/admin/login',
      {
        username: 'admin',
        password: 'admin123'
      },
      { 'X-Admin-API-Key': process.env.ADMIN_API_KEY || 'admin-api-key-change-in-production' }
    );
    
    this.helpers.assertSuccess(loginResponse, 200);
    this.adminUser = loginResponse.data;
  }

  async testRealtimeDashboard() {
    await this.runTest('Real-time Dashboard Data', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3006/admin/dashboard/realtime',
        null,
        {
          'X-Admin-API-Key': process.env.ADMIN_API_KEY || 'admin-api-key-change-in-production',
          'Authorization': `Bearer ${this.adminUser.token}`
        }
      );

      this.helpers.assertSuccess(response, 200);
      
      if (!response.data.timestamp) {
        throw new Error('Missing timestamp in real-time data');
      }
      
      if (typeof response.data.activeUsers !== 'number') {
        throw new Error('Missing or invalid activeUsers data');
      }
      
      if (typeof response.data.systemLoad !== 'number') {
        throw new Error('Missing or invalid systemLoad data');
      }
    });
  }

  async testUserAnalyticsChart() {
    await this.runTest('User Analytics Chart', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3006/admin/dashboard/charts/users',
        null,
        {
          'X-Admin-API-Key': process.env.ADMIN_API_KEY || 'admin-api-key-change-in-production',
          'Authorization': `Bearer ${this.adminUser.token}`
        }
      );

      this.helpers.assertSuccess(response, 200);
      
      if (!response.data.title || response.data.title !== 'User Analytics') {
        throw new Error('Invalid chart title');
      }
      
      if (!response.data.type || response.data.type !== 'line') {
        throw new Error('Invalid chart type');
      }
      
      if (!Array.isArray(response.data.datasets) || response.data.datasets.length === 0) {
        throw new Error('Missing chart datasets');
      }
    });
  }

  async testPhotoAnalyticsChart() {
    await this.runTest('Photo Analytics Chart', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3006/admin/dashboard/charts/photos',
        null,
        {
          'X-Admin-API-Key': process.env.ADMIN_API_KEY || 'admin-api-key-change-in-production',
          'Authorization': `Bearer ${this.adminUser.token}`
        }
      );

      this.helpers.assertSuccess(response, 200);
      
      if (!response.data.title || response.data.title !== 'Photo Moderation Status') {
        throw new Error('Invalid chart title');
      }
      
      if (!response.data.type || response.data.type !== 'pie') {
        throw new Error('Invalid chart type');
      }
      
      const dataset = response.data.datasets[0];
      if (!Array.isArray(dataset.data) || !Array.isArray(dataset.labels)) {
        throw new Error('Missing chart data or labels');
      }
    });
  }

  async testReportsChart() {
    await this.runTest('Reports Analytics Chart', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3006/admin/dashboard/charts/reports',
        null,
        {
          'X-Admin-API-Key': process.env.ADMIN_API_KEY || 'admin-api-key-change-in-production',
          'Authorization': `Bearer ${this.adminUser.token}`
        }
      );

      this.helpers.assertSuccess(response, 200);
      
      if (!response.data.title || !response.data.title.includes('Reports Over Time')) {
        throw new Error('Invalid chart title');
      }
      
      if (!response.data.type || response.data.type !== 'bar') {
        throw new Error('Invalid chart type');
      }
      
      const dataset = response.data.datasets[0];
      if (!Array.isArray(dataset.data)) {
        throw new Error('Missing chart data');
      }
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Starting Admin Dashboard Tests\n', 'blue');
    
    await this.setupAdminUser();
    await this.testRealtimeDashboard();
    await this.testUserAnalyticsChart();
    await this.testPhotoAnalyticsChart();
    await this.testReportsChart();

    if (config.test.cleanup) {
      await this.helpers.cleanup();
    }

    return this.testResults;
  }
}

module.exports = AdminDashboardTests;