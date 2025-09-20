#!/usr/bin/env node

const chalk = require('chalk');
const AuthTests = require('./auth-tests-optimized');
const PhotoTests = require('./photo-tests');
const ChatTests = require('./chat-tests');
const GatewayTests = require('./gateway-tests');

class TestRunner {
  constructor() {
    this.args = this.parseArgs();
    this.allResults = [];
  }

  parseArgs() {
    const args = process.argv.slice(2);
    const parsed = {
      suite: 'server',
      endpoint: null,
      verbose: true,
      cleanup: true
    };

    args.forEach(arg => {
      if (arg.startsWith('--suite=')) {
        parsed.suite = arg.split('=')[1];
      } else if (arg.startsWith('--endpoint=')) {
        parsed.endpoint = arg.split('=')[1];
      } else if (arg === '--no-cleanup') {
        parsed.cleanup = false;
      } else if (arg === '--quiet') {
        parsed.verbose = false;
      }
    });

    return parsed;
  }

  async checkServices() {
    console.log(chalk.blue('🔍 Checking service availability...'));
    
    const services = [
      { name: 'Auth Service', url: 'http://localhost:3001/auth/health' },
      { name: 'Photo Service', url: 'http://localhost:3002/photos/health' },
      { name: 'Gateway', url: 'http://localhost:8081/health' }
    ];

    const axios = require('axios');
    const unavailable = [];

    for (const service of services) {
      try {
        await axios.get(service.url, { timeout: 5000 });
        console.log(chalk.green(`✅ ${service.name} - Available`));
      } catch (error) {
        console.log(chalk.red(`❌ ${service.name} - Unavailable`));
        unavailable.push(service.name);
      }
    }

    if (unavailable.length > 0) {
      console.log(chalk.red(`\n⚠️  Some services are unavailable: ${unavailable.join(', ')}`));
      console.log(chalk.yellow('Make sure all services are running with: docker-compose up -d'));
      return false;
    }

    console.log(chalk.green('✅ All services are available\n'));
    return true;
  }

  async runAuthTests() {
    const authTests = new AuthTests();
    const results = await authTests.runAllTests();
    this.allResults.push(...results);
    return results;
  }

  async runPhotoTests() {
    const photoTests = new PhotoTests();
    const results = await photoTests.runAllTests();
    this.allResults.push(...results);
    return results;
  }

  async runChatTests() {
    const chatTests = new ChatTests();
    const results = await chatTests.runAllTests();
    this.allResults.push(...results);
    return results;
  }

  async runGatewayTests() {
    const gatewayTests = new GatewayTests();
    const results = await gatewayTests.runAllTests();
    this.allResults.push(...results);
    return results;
  }

  async runAllTests() {
    console.log(chalk.blue.bold('🚀 Phone App Server Test Suite\n'));
    
    const servicesAvailable = await this.checkServices();
    if (!servicesAvailable) {
      process.exit(1);
    }

    const startTime = Date.now();

    if (this.args.endpoint) {
      // Run specific endpoint tests
      switch (this.args.endpoint.toLowerCase()) {
        case 'auth':
          await this.runAuthTests();
          break;
        case 'photos':
          await this.runPhotoTests();
          break;
        case 'chat':
          await this.runChatTests();
          break;
        case 'gateway':
          await this.runGatewayTests();
          break;
        default:
          console.log(chalk.red(`Unknown endpoint: ${this.args.endpoint}`));
          console.log(chalk.yellow('Available endpoints: auth, photos, chat, gateway'));
          process.exit(1);
      }
    } else {
      // Run all tests
      await this.runAuthTests();
      await this.runPhotoTests();
      await this.runChatTests();
      await this.runGatewayTests();
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    this.printSummary(duration);
  }

  printSummary(duration) {
    console.log(chalk.blue.bold('\n📊 Test Summary'));
    console.log(chalk.blue('='.repeat(50)));

    const passed = this.allResults.filter(r => r.status === 'PASSED').length;
    const failed = this.allResults.filter(r => r.status === 'FAILED').length;
    const total = this.allResults.length;

    console.log(`Total Tests: ${total}`);
    console.log(chalk.green(`Passed: ${passed}`));
    console.log(chalk.red(`Failed: ${failed}`));
    console.log(`Duration: ${duration}s`);

    if (failed > 0) {
      console.log(chalk.red.bold('\n❌ Failed Tests:'));
      this.allResults
        .filter(r => r.status === 'FAILED')
        .forEach(test => {
          console.log(chalk.red(`  • ${test.name}: ${test.error}`));
        });
    }

    const successRate = ((passed / total) * 100).toFixed(1);
    console.log(chalk.blue(`\nSuccess Rate: ${successRate}%`));

    if (failed === 0) {
      console.log(chalk.green.bold('\n🎉 All tests passed!'));
      process.exit(0);
    } else {
      console.log(chalk.red.bold('\n💥 Some tests failed!'));
      process.exit(1);
    }
  }

  showUsage() {
    console.log(chalk.blue.bold('Phone App Test Suite Usage:'));
    console.log('');
    console.log('Run all server tests:');
    console.log('  npm test');
    console.log('  npm run test:server');
    console.log('');
    console.log('Run specific endpoint tests:');
    console.log('  npm run test:auth');
    console.log('  npm run test:photos');
    console.log('');
    console.log('Options:');
    console.log('  --endpoint=<name>  Run tests for specific endpoint (auth, photos, gateway)');
    console.log('  --no-cleanup       Skip database cleanup after tests');
    console.log('  --quiet            Reduce output verbosity');
    console.log('');
    console.log('Examples:');
    console.log('  node test-runner.js --endpoint=auth');
    console.log('  node test-runner.js --no-cleanup');
  }
}

// Handle command line execution
if (require.main === module) {
  const runner = new TestRunner();
  
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    runner.showUsage();
    process.exit(0);
  }

  runner.runAllTests().catch(error => {
    console.error(chalk.red('Test runner error:'), error);
    process.exit(1);
  });
}

module.exports = TestRunner;