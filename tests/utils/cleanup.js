#!/usr/bin/env node

const { MongoClient } = require('mongodb');
const chalk = require('chalk');

class DatabaseCleanup {
  constructor() {
    this.mongoUrl = 'mongodb://localhost:27017';
  }

  async cleanupTestData() {
    console.log(chalk.blue('🧹 Starting database cleanup...'));
    
    try {
      const client = new MongoClient(this.mongoUrl);
      await client.connect();
      console.log(chalk.green('✅ Connected to MongoDB'));

      // Clean auth database
      await this.cleanupAuthData(client);
      
      // Clean photos database
      await this.cleanupPhotosData(client);

      await client.close();
      console.log(chalk.green('✅ Database cleanup completed successfully'));
      
    } catch (error) {
      console.error(chalk.red('❌ Database cleanup failed:'), error.message);
      process.exit(1);
    }
  }

  async cleanupAuthData(client) {
    const { ObjectId } = require('mongodb');
    const authDb = client.db('auth');
    
    // Delete test users (those with test_ prefix or created in last hour)
    const testUserFilter = {
      $or: [
        { username: { $regex: /^test.*_\d+$/ } },
        { email: { $regex: /^test.*_\d+@/ } },
        { createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } }
      ]
    };

    const usersResult = await authDb.collection('users').deleteMany(testUserFilter);
    console.log(chalk.yellow(`🗑️  Deleted ${usersResult.deletedCount} test users`));

    // Delete associated sessions
    const sessionsResult = await authDb.collection('sessions').deleteMany({
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
    });
    console.log(chalk.yellow(`🗑️  Deleted ${sessionsResult.deletedCount} test sessions`));
  }

  async cleanupPhotosData(client) {
    const photosDb = client.db('photos');
    
    // Delete test photos (those with test caption or created in last hour)
    const testPhotoFilter = {
      $or: [
        { caption: { $regex: /test.*automated.*test.*suite/i } },
        { uploadedAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } }
      ]
    };

    const photosResult = await photosDb.collection('photos').deleteMany(testPhotoFilter);
    console.log(chalk.yellow(`🗑️  Deleted ${photosResult.deletedCount} test photos`));
  }

  async cleanupAll() {
    console.log(chalk.red.bold('⚠️  WARNING: This will delete ALL data in test databases!'));
    console.log(chalk.yellow('This should only be used in development environments.'));
    
    // In a real implementation, you'd want confirmation here
    // For now, we'll just clean test data
    await this.cleanupTestData();
  }

  showUsage() {
    console.log(chalk.blue.bold('Database Cleanup Utility'));
    console.log('');
    console.log('Usage:');
    console.log('  npm run test:cleanup     # Clean test data only');
    console.log('  node cleanup.js          # Clean test data only');
    console.log('  node cleanup.js --all    # Clean all data (dangerous!)');
    console.log('');
    console.log('This utility removes:');
    console.log('  • Users with test_ prefix in username/email');
    console.log('  • Users created in the last hour');
    console.log('  • Photos with test captions');
    console.log('  • Photos uploaded in the last hour');
    console.log('  • Associated sessions and metadata');
  }
}

// Handle command line execution
if (require.main === module) {
  const cleanup = new DatabaseCleanup();
  
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    cleanup.showUsage();
    process.exit(0);
  }

  if (process.argv.includes('--all')) {
    cleanup.cleanupAll().catch(error => {
      console.error(chalk.red('Cleanup error:'), error);
      process.exit(1);
    });
  } else {
    cleanup.cleanupTestData().catch(error => {
      console.error(chalk.red('Cleanup error:'), error);
      process.exit(1);
    });
  }
}

module.exports = DatabaseCleanup;