import 'dotenv/config';
import { initializeBot } from './whatsapp/bot.js';
import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
});

/**
 * Main application entry point
 */
const startApp = async () => {
  try {
    logger.info('🚀 Starting TechHub WhatsApp Marketplace...');

    // Check required environment variables
    const requiredEnvVars = [
      'MONGODB_URI',
      'GEMINI_API_KEY',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      logger.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
      logger.info('Please copy .env.example to .env and fill in the required values.');
      process.exit(1);
    }

    // Initialize WhatsApp bot
    await initializeBot();

    logger.info('✅ Application started successfully');

    // Handle process termination
    process.on('SIGINT', async () => {
      logger.info('Shutting down gracefully...');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Shutting down gracefully...');
      process.exit(0);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection at:', promise, 'reason:', reason);
    });

  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
};

// Start the application
startApp();
