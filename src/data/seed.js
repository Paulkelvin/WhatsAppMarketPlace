import 'dotenv/config';
import { connectDB, disconnectDB } from '../services/database.js';
import Product from '../models/Product.js';
import { sampleProducts } from './sampleProducts.js';
import pino from 'pino';

const logger = pino();

/**
 * Seed database with sample products
 */
const seedDatabase = async () => {
  try {
    logger.info('🌱 Starting database seed...');

    // Connect to database
    await connectDB();

    // Clear existing products (optional - comment out to keep existing)
    // await Product.deleteMany({});
    // logger.info('Cleared existing products');

    // Insert sample products
    const inserted = await Product.insertMany(sampleProducts);
    logger.info(`✅ Inserted ${inserted.length} products`);

    // Display summary
    const categories = {};
    inserted.forEach(product => {
      categories[product.category] = (categories[product.category] || 0) + 1;
    });

    logger.info('\n📊 Products by category:');
    Object.entries(categories).forEach(([category, count]) => {
      logger.info(`   ${category}: ${count} products`);
    });

    logger.info('\n🎉 Database seeding completed successfully!');

    // Disconnect
    await disconnectDB();
    process.exit(0);

  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
