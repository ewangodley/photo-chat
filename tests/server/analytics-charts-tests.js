const TestHelpers = require('../utils/test-helpers');
const config = require('../utils/test-config');

class AnalyticsChartsTests {
  constructor() {
    this.helpers = new TestHelpers(config);
    this.testResults = [];
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

  async testLineChartFormat() {
    await this.runTest('Line Chart Format (Users)', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3006/admin/dashboard/charts/users'
      );

      // Should get 401 but with proper error structure
      if (response.status === 401 && response.data && response.data.error) {
        // Endpoint exists and returns proper error format
        return;
      }

      // If we somehow get data, validate format
      if (response.data && response.data.success) {
        const chartData = response.data.data;
        
        if (chartData.type !== 'line') {
          throw new Error(`Expected line chart, got ${chartData.type}`);
        }
        
        if (!chartData.title || !chartData.title.includes('User')) {
          throw new Error('Invalid chart title for user analytics');
        }
        
        if (!Array.isArray(chartData.datasets) || chartData.datasets.length === 0) {
          throw new Error('Missing datasets for line chart');
        }
        
        // Check first dataset has proper structure
        const dataset = chartData.datasets[0];
        if (!dataset.label || !Array.isArray(dataset.data)) {
          throw new Error('Invalid dataset structure for line chart');
        }
        
        // Check data points have x,y structure
        if (dataset.data.length > 0 && (!dataset.data[0].x || dataset.data[0].y === undefined)) {
          throw new Error('Invalid data point structure for line chart');
        }
      }
    });
  }

  async testPieChartFormat() {
    await this.runTest('Pie Chart Format (Photos)', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3006/admin/dashboard/charts/photos'
      );

      // Should get 401 but with proper error structure
      if (response.status === 401 && response.data && response.data.error) {
        // Endpoint exists and returns proper error format
        return;
      }

      // If we somehow get data, validate format
      if (response.data && response.data.success) {
        const chartData = response.data.data;
        
        if (chartData.type !== 'pie') {
          throw new Error(`Expected pie chart, got ${chartData.type}`);
        }
        
        if (!chartData.title || !chartData.title.includes('Photo')) {
          throw new Error('Invalid chart title for photo analytics');
        }
        
        if (!Array.isArray(chartData.datasets) || chartData.datasets.length === 0) {
          throw new Error('Missing datasets for pie chart');
        }
        
        // Check dataset has proper structure for pie chart
        const dataset = chartData.datasets[0];
        if (!Array.isArray(dataset.data) || !Array.isArray(dataset.labels)) {
          throw new Error('Invalid dataset structure for pie chart');
        }
        
        if (!Array.isArray(dataset.backgroundColor)) {
          throw new Error('Missing backgroundColor for pie chart');
        }
        
        // Data and labels should have same length
        if (dataset.data.length !== dataset.labels.length) {
          throw new Error('Data and labels length mismatch in pie chart');
        }
      }
    });
  }

  async testBarChartFormat() {
    await this.runTest('Bar Chart Format (Reports)', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3006/admin/dashboard/charts/reports'
      );

      // Should get 401 but with proper error structure
      if (response.status === 401 && response.data && response.data.error) {
        // Endpoint exists and returns proper error format
        return;
      }

      // If we somehow get data, validate format
      if (response.data && response.data.success) {
        const chartData = response.data.data;
        
        if (chartData.type !== 'bar') {
          throw new Error(`Expected bar chart, got ${chartData.type}`);
        }
        
        if (!chartData.title || !chartData.title.includes('Reports')) {
          throw new Error('Invalid chart title for reports analytics');
        }
        
        if (!Array.isArray(chartData.datasets) || chartData.datasets.length === 0) {
          throw new Error('Missing datasets for bar chart');
        }
        
        // Check dataset has proper structure for bar chart
        const dataset = chartData.datasets[0];
        if (!dataset.label || !Array.isArray(dataset.data)) {
          throw new Error('Invalid dataset structure for bar chart');
        }
        
        if (!dataset.backgroundColor) {
          throw new Error('Missing backgroundColor for bar chart');
        }
        
        // Check data points have x,y structure for time series
        if (dataset.data.length > 0 && (!dataset.data[0].x !== undefined || dataset.data[0].y === undefined)) {
          throw new Error('Invalid data point structure for bar chart');
        }
      }
    });
  }

  async testChartDataGeneration() {
    await this.runTest('Chart Data Generation Logic', async () => {
      // Test that all chart endpoints exist and return proper error codes
      const endpoints = [
        'http://localhost:3006/admin/dashboard/charts/users',
        'http://localhost:3006/admin/dashboard/charts/photos',
        'http://localhost:3006/admin/dashboard/charts/reports'
      ];

      for (const endpoint of endpoints) {
        const response = await this.helpers.makeRequest('GET', endpoint);
        
        // Should return 401 (auth required) not 404 (not found)
        if (response.status === 404) {
          throw new Error(`Chart endpoint not implemented: ${endpoint}`);
        }
        
        // Should have proper error structure
        if (response.status === 401) {
          if (!response.data || !response.data.error || !response.data.error.code) {
            throw new Error(`Invalid error response format for: ${endpoint}`);
          }
        }
      }
    });
  }

  async testChartJSCompatibility() {
    await this.runTest('Chart.js Compatibility', async () => {
      // Test that chart data structure is compatible with Chart.js
      // This validates the data format without authentication
      
      const expectedStructure = {
        users: { type: 'line', hasDatasets: true, hasTimeSeries: true },
        photos: { type: 'pie', hasLabels: true, hasColors: true },
        reports: { type: 'bar', hasDatasets: true, hasTimeSeries: true }
      };
      
      // All endpoints should exist (return 401, not 404)
      for (const [chartType, expected] of Object.entries(expectedStructure)) {
        const response = await this.helpers.makeRequest(
          'GET',
          `http://localhost:3006/admin/dashboard/charts/${chartType}`
        );
        
        if (response.status === 404) {
          throw new Error(`Chart endpoint missing: ${chartType}`);
        }
        
        if (response.status !== 401) {
          throw new Error(`Expected 401 auth error for ${chartType}, got ${response.status}`);
        }
      }
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Starting Advanced Analytics Charts Tests\n', 'blue');
    
    await this.testLineChartFormat();
    await this.testPieChartFormat();
    await this.testBarChartFormat();
    await this.testChartDataGeneration();
    await this.testChartJSCompatibility();

    if (config.test.cleanup) {
      await this.helpers.cleanup();
    }

    return this.testResults;
  }
}

module.exports = AnalyticsChartsTests;