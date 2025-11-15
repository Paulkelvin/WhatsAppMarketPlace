import 'dotenv/config';
import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

/**
 * Verify Environment Configuration
 */
const verifySetup = () => {
  logger.info('🔍 Verifying TechHub WhatsApp Marketplace Setup...\n');

  let hasErrors = false;

  // Check required environment variables
  const requiredVars = [
    'MONGODB_URI',
    'GEMINI_API_KEY',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const optionalVars = [
    'PAYSTACK_SECRET_KEY',
    'PAYSTACK_PUBLIC_KEY',
    'ADMIN_PHONE',
    'BUSINESS_PHONE',
    'BUSINESS_EMAIL'
  ];

  logger.info('📋 Checking Required Environment Variables:\n');

  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      logger.info(`✅ ${varName}: Set`);
    } else {
      logger.error(`❌ ${varName}: Missing`);
      hasErrors = true;
    }
  });

  logger.info('\n📋 Checking Optional Environment Variables:\n');

  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      logger.info(`✅ ${varName}: Set`);
    } else {
      logger.warn(`⚠️  ${varName}: Not set (optional)`);
    }
  });

  // Check Node version
  logger.info('\n🔧 System Information:\n');
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

  if (majorVersion >= 18) {
    logger.info(`✅ Node.js Version: ${nodeVersion}`);
  } else {
    logger.error(`❌ Node.js Version: ${nodeVersion} (Required: v18 or higher)`);
    hasErrors = true;
  }

  logger.info(`✅ Platform: ${process.platform}`);
  logger.info(`✅ Architecture: ${process.arch}`);

  // Check MongoDB URI format
  if (process.env.MONGODB_URI) {
    if (process.env.MONGODB_URI.startsWith('mongodb+srv://') || 
        process.env.MONGODB_URI.startsWith('mongodb://')) {
      logger.info('\n✅ MongoDB URI format looks correct');
    } else {
      logger.error('\n❌ MongoDB URI format seems incorrect');
      hasErrors = true;
    }
  }

  // Check phone number format
  if (process.env.ADMIN_PHONE) {
    if (process.env.ADMIN_PHONE.startsWith('+234')) {
      logger.info('✅ Admin phone number format looks correct');
    } else {
      logger.warn('⚠️  Admin phone should start with +234 (Nigerian format)');
    }
  }

  // Final status
  logger.info('\n' + '='.repeat(50));
  
  if (hasErrors) {
    logger.error('\n❌ SETUP INCOMPLETE');
    logger.info('\nPlease fix the errors above before starting the application.');
    logger.info('Refer to README.md for detailed setup instructions.\n');
    process.exit(1);
  } else {
    logger.info('\n✅ SETUP COMPLETE!');
    logger.info('\nYour TechHub WhatsApp Marketplace is ready to start!');
    logger.info('\nNext steps:');
    logger.info('1. Run: npm run seed (to add sample products)');
    logger.info('2. Run: npm start (to start the bot)');
    logger.info('3. Scan QR code with WhatsApp');
    logger.info('4. Test with: "Hello" from another number\n');
    process.exit(0);
  }
};

verifySetup();
