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

// Store latest QR code
let latestQR = null;

export const updateQR = (qr) => {
  latestQR = qr;
};

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

    app.get('/qr', (req, res) => {
      if (!latestQR) {
        res.send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>WhatsApp QR Code</title>
              <style>
                body { font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0; }
                .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
                h1 { color: #25D366; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>🔄 Waiting for QR Code...</h1>
                <p>The bot is initializing. Please refresh in a few seconds.</p>
                <script>setTimeout(() => location.reload(), 3000);</script>
              </div>
            </body>
          </html>
        `);
      } else {
        res.send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>WhatsApp QR Code</title>
              <style>
                body { font-family: Arial; text-align: center; padding: 20px; background: #f0f0f0; }
                .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; }
                h1 { color: #25D366; margin-bottom: 10px; }
                .instructions { color: #666; margin: 20px 0; line-height: 1.6; }
                .qr-container { background: white; padding: 20px; border-radius: 10px; display: inline-block; margin: 20px 0; }
                #qr { max-width: 400px; height: auto; }
                .warning { color: #ff6b6b; font-size: 14px; margin-top: 15px; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>📱 Scan to Connect WhatsApp</h1>
                <div class="instructions">
                  <strong>Steps:</strong><br>
                  1. Open WhatsApp on <strong>08169826503</strong><br>
                  2. Go to <strong>Settings → Linked Devices</strong><br>
                  3. Tap <strong>"Link a Device"</strong><br>
                  4. Scan this QR code with the in-app scanner
                </div>
                <div class="qr-container">
                  <div id="qr"></div>
                </div>
                <p class="warning">⏱️ QR code expires in ~60 seconds. Refresh if needed.</p>
                <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
                <script>
                  QRCode.toCanvas('${latestQR}', { 
                    width: 400, 
                    margin: 2,
                    color: {
                      dark: '#000000',
                      light: '#FFFFFF'
                    }
                  }, (error, canvas) => {
                    if (error) console.error(error);
                    document.getElementById('qr').appendChild(canvas);
                  });
                  
                  // Auto refresh every 55 seconds
                  setTimeout(() => location.reload(), 55000);
                </script>
              </div>
            </body>
          </html>
        `);
      }
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
