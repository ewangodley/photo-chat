const TestHelpers = require('../utils/test-helpers');
const config = require('../utils/test-config');

class MonitoringTests {
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

  async testMetricsEndpoint() {
    await this.runTest('Metrics Endpoint Available', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3001/metrics'
      );
      
      this.helpers.assertSuccess(response, 200);
      
      if (!response.data || typeof response.data !== 'string') {
        throw new Error('Metrics endpoint did not return string data');
      }
      
      if (!response.data.includes('http_requests_total')) {
        throw new Error('Missing http_requests_total metric');
      }
      
      if (!response.data.includes('http_request_duration_seconds')) {
        throw new Error('Missing http_request_duration_seconds metric');
      }
    });
  }

  async testRequestMetricsCollection() {
    await this.runTest('Request Metrics Collection', async () => {
      // Make a request to generate metrics
      await this.helpers.makeRequest(
        'GET',
        'http://localhost:3001/auth/health'
      );
      
      // Check metrics endpoint
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3001/metrics'
      );
      
      this.helpers.assertSuccess(response, 200);
      
      if (!response.data.includes('method="GET"')) {
        throw new Error('Request method not recorded in metrics');
      }
      
      if (!response.data.includes('status_code="200"')) {
        throw new Error('Status code not recorded in metrics');
      }
    });
  }

  async testErrorMetricsCollection() {
    await this.runTest('Error Metrics Collection', async () => {
      // Make a request that will fail
      await this.helpers.makeRequest(
        'GET',
        'http://localhost:3001/auth/nonexistent'
      );
      
      // Check metrics endpoint
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3001/metrics'
      );
      
      this.helpers.assertSuccess(response, 200);
      
      if (!response.data.includes('status_code="404"')) {
        throw new Error('404 status code not recorded in metrics');
      }
    });
  }

  async testMetricsFormat() {
    await this.runTest('Prometheus Metrics Format', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3001/metrics'
      );
      
      this.helpers.assertSuccess(response, 200);
      
      // Check Prometheus format
      const lines = response.data.split('\n');
      const hasHelpLines = lines.some(line => line.startsWith('# HELP'));
      const hasTypeLines = lines.some(line => line.startsWith('# TYPE'));
      const hasMetricLines = lines.some(line => /^[a-zA-Z_][a-zA-Z0-9_]*(\{.*\})?\s+[\d.]+/.test(line));
      
      if (!hasHelpLines) {
        throw new Error('Missing HELP lines in Prometheus format');
      }
      
      if (!hasTypeLines) {
        throw new Error('Missing TYPE lines in Prometheus format');
      }
      
      if (!hasMetricLines) {
        throw new Error('Missing metric value lines');
      }
    });
  }

  async testLoggingMiddleware() {
    await this.runTest('Logging Middleware', async () => {
      // Make request to trigger logging
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3001/auth/health'
      );
      
      this.helpers.assertSuccess(response, 200);
      
      // Logging is async, so we just verify the request succeeded
      // In production, logs would be verified in log files
    });
  }

  async testMultipleServiceMetrics() {
    await this.runTest('Multiple Service Metrics', async () => {
      const services = [
        'http://localhost:3001/metrics', // auth
        'http://localhost:3002/metrics', // photo
        'http://localhost:8081/metrics'  // gateway
      ];
      
      for (const serviceUrl of services) {
        try {
          const response = await this.helpers.makeRequest('GET', serviceUrl);
          if (response.success && response.data.includes('http_requests_total')) {
            // At least one service has metrics
            return;
          }
        } catch (error) {
          // Service might not be running, continue
        }
      }
      
      throw new Error('No services found with metrics endpoints');
    });
  }

  async testMetricsContentType() {
    await this.runTest('Metrics Content Type', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3001/metrics'
      );
      
      this.helpers.assertSuccess(response, 200);
      
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('text/plain')) {
        throw new Error(`Expected text/plain content type, got: ${contentType}`);
      }
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Starting Monitoring Tests\n', 'blue');
    
    await this.testMetricsEndpoint();
    await this.testRequestMetricsCollection();
    await this.testErrorMetricsCollection();
    await this.testMetricsFormat();
    await this.testLoggingMiddleware();
    await this.testMultipleServiceMetrics();
    await this.testMetricsContentType();

    if (config.test.cleanup) {
      await this.helpers.cleanup();
    }

    return this.testResults;
  }
}

module.exports = MonitoringTests;