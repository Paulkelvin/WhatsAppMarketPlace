import 'dotenv/config';
import express from 'express';
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

// Create Express app for health checks (Railway needs this)
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Main application entry point
 */
const startApp = async () => {
  try {
    logger.info('🚀 Starting TechHub WhatsApp Marketplace...');

    // Start HTTP server for Railway health checks
    app.get('/', (req, res) => {
      res.json({ 
        status: 'online', 
        service: 'TechHub WhatsApp Marketplace',
        timestamp: new Date().toISOString()
      });
    });

    app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    const server = app.listen(PORT, () => {
      logger.info(`✅ HTTP server listening on port ${PORT}`);
    });

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

    logger.info('✅ Application started successfully');

    // Initialize WhatsApp bot in background (don't block startup)
    initializeBot().catch(error => {
      logger.error('❌ Failed to initialize WhatsApp bot:', error);
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      logger.info('Shutting down gracefully...');
      server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Shutting down gracefully...');
      server.close();
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
