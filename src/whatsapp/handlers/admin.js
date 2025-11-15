import pino from 'pino';
import { sendMessage } from '../bot.js';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import Customer from '../../models/Customer.js';
import { uploadWhatsAppMedia } from '../../services/cloudinary.js';
import { downloadMedia } from '../bot.js';

const logger = pino();

/**
 * Handle admin commands
 * @param {Object} sock - WhatsApp socket
 * @param {string} jid - Admin WhatsApp JID
 * @param {string} command - Command text
 */
export const handleAdminCommand = async (sock, jid, command) => {
  try {
    const [cmd, ...args] = command.trim().split(' ');

    logger.info(`Admin command: ${cmd} from ${jid}`);

    switch (cmd.toLowerCase()) {
      case '!help':
        await sendHelpMessage(jid);
        break;

      case '!orders':
        await sendOrdersList(jid, args[0]);
        break;

      case '!addproduct':
        await sendAddProductInstructions(jid);
        break;

      case '!updatestock':
        await handleUpdateStock(jid, args);
        break;

      case '!analytics':
        await sendAnalytics(jid);
        break;

      case '!broadcast':
        await sendBroadcastInstructions(jid);
        break;

      case '!customers':
        await sendCustomerStats(jid);
        break;

      case '!products':
        await sendProductsList(jid);
        break;

      default:
        await sendMessage(jid, `Unknown command: ${cmd}\n\nReply "!help" to see available commands.`);
    }

  } catch (error) {
    logger.error('Admin command error:', error);
    await sendMessage(jid, "Error processing command. Please try again.");
  }
};

/**
 * Send help message with all available commands
 */
const sendHelpMessage = async (jid) => {
  const helpMessage = 
    `🤖 *ADMIN COMMANDS*\n\n` +
    `*Order Management:*\n` +
    `!orders [status] - View orders (pending, confirmed, all)\n` +
    `!updateorder <orderId> <status> - Update order status\n\n` +
    `*Product Management:*\n` +
    `!products - List all products\n` +
    `!addproduct - Instructions to add product\n` +
    `!updatestock <productId> <quantity> - Update stock\n\n` +
    `*Analytics:*\n` +
    `!analytics - View sales analytics\n` +
    `!customers - View customer statistics\n\n` +
    `*Communication:*\n` +
    `!broadcast - Instructions for broadcasting\n\n` +
    `*System:*\n` +
    `!help - Show this help message\n\n` +
    `Examples:\n` +
    `• !orders pending\n` +
    `• !updatestock PRD-001 50\n` +
    `• !analytics`;

  await sendMessage(jid, helpMessage);
};

/**
 * Send orders list
 */
const sendOrdersList = async (jid, statusFilter = 'pending') => {
  try {
    let orders;

    if (statusFilter === 'all') {
      orders = await Order.find()
        .sort('-createdAt')
        .limit(10);
    } else {
      const status = statusFilter || 'pending';
      orders = await Order.find({ status })
        .sort('-createdAt')
        .limit(10);
    }

    if (orders.length === 0) {
      await sendMessage(jid, `No ${statusFilter} orders found.`);
      return;
    }

    let message = `📦 *${statusFilter.toUpperCase()} ORDERS* (${orders.length})\n\n`;

    orders.forEach(order => {
      message += 
        `*${order.orderId}*\n` +
        `Customer: ${order.customer.name || order.customer.phone}\n` +
        `Items: ${order.items.length} | Total: ₦${order.pricing.total.toLocaleString()}\n` +
        `Payment: ${order.payment.method === 'cod' ? 'COD' : 'Transfer'} (${order.payment.status})\n` +
        `State: ${order.delivery.address.state}\n` +
        `Date: ${order.createdAt.toLocaleDateString()}\n` +
        `─────────────\n`;
    });

    message += `\nTo update an order:\n!updateorder <orderId> <status>`;

    await sendMessage(jid, message);

  } catch (error) {
    logger.error('Orders list error:', error);
    await sendMessage(jid, "Error retrieving orders.");
  }
};

/**
 * Send add product instructions
 */
const sendAddProductInstructions = async (jid) => {
  const message = 
    `📦 *ADD NEW PRODUCT*\n\n` +
    `To add a product, use the web dashboard:\n` +
    `🌐 ${process.env.VERCEL_URL || 'http://localhost:3000'}/admin\n\n` +
    `Or send product details in this format:\n\n` +
    `ADD PRODUCT\n` +
    `Name: iPhone 15 Pro Max\n` +
    `Price: 1200000\n` +
    `Stock: 10\n` +
    `Category: smartphones\n` +
    `Description: Latest iPhone with...\n\n` +
    `Then send product images (1-5 images)\n\n` +
    `Available categories:\n` +
    `smartphones, laptops, accessories, smartwatches, tablets, audio, gaming, cameras`;

  await sendMessage(jid, message);
};

/**
 * Handle stock update
 */
const handleUpdateStock = async (jid, args) => {
  try {
    if (args.length < 2) {
      await sendMessage(jid, "Usage: !updatestock <productId> <quantity>\n\nExample: !updatestock PRD-001 50");
      return;
    }

    const [productId, quantityStr] = args;
    const quantity = parseInt(quantityStr);

    if (isNaN(quantity)) {
      await sendMessage(jid, "Invalid quantity. Please provide a number.");
      return;
    }

    const product = await Product.findOne({ productId });

    if (!product) {
      await sendMessage(jid, `Product ${productId} not found.`);
      return;
    }

    const oldStock = product.stock;
    product.stock = quantity;
    
    if (quantity > 0 && product.status === 'out-of-stock') {
      product.status = 'active';
    }

    await product.save();

    await sendMessage(
      jid,
      `✅ Stock updated successfully!\n\n` +
      `Product: ${product.name}\n` +
      `Old Stock: ${oldStock}\n` +
      `New Stock: ${quantity}\n` +
      `Status: ${product.status}`
    );

  } catch (error) {
    logger.error('Update stock error:', error);
    await sendMessage(jid, "Error updating stock.");
  }
};

/**
 * Send analytics
 */
const sendAnalytics = async (jid) => {
  try {
    // Get today's revenue
    const todayRevenue = await Order.getDailyRevenue();

    // Get this month's stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyOrders = await Order.find({
      createdAt: { $gte: startOfMonth },
      status: { $ne: 'cancelled' }
    });

    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.pricing.total, 0);

    // Get pending orders
    const pendingCount = await Order.countDocuments({ 
      status: { $in: ['pending', 'confirmed', 'processing'] }
    });

    // Get total customers
    const totalCustomers = await Customer.countDocuments();
    const vipCustomers = await Customer.countDocuments({ isVIP: true });

    // Get low stock products
    const lowStock = await Product.getLowStock();

    const message = 
      `📊 *SALES ANALYTICS*\n\n` +
      `*Today:*\n` +
      `Revenue: ₦${todayRevenue.totalRevenue.toLocaleString()}\n` +
      `Orders: ${todayRevenue.orderCount}\n\n` +
      `*This Month:*\n` +
      `Revenue: ₦${monthlyRevenue.toLocaleString()}\n` +
      `Orders: ${monthlyOrders.length}\n\n` +
      `*Customers:*\n` +
      `Total: ${totalCustomers}\n` +
      `VIP: ${vipCustomers}\n\n` +
      `*Pending Orders:* ${pendingCount}\n\n` +
      `⚠️ *Low Stock Alert:* ${lowStock.length} products\n\n` +
      `For detailed analytics, visit:\n` +
      `🌐 ${process.env.VERCEL_URL || 'http://localhost:3000'}/admin/analytics`;

    await sendMessage(jid, message);

  } catch (error) {
    logger.error('Analytics error:', error);
    await sendMessage(jid, "Error retrieving analytics.");
  }
};

/**
 * Send customer statistics
 */
const sendCustomerStats = async (jid) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const vipCustomers = await Customer.getVIPCustomers();
    const inactiveCustomers = await Customer.getInactiveCustomers(30);
    const abandonedCarts = await Customer.getCustomersWithAbandonedCarts();

    // Get top customers
    const topCustomers = await Customer.find({ status: 'active' })
      .sort('-totalSpent')
      .limit(5);

    let message = 
      `👥 *CUSTOMER STATISTICS*\n\n` +
      `Total Customers: ${totalCustomers}\n` +
      `VIP Customers: ${vipCustomers.length}\n` +
      `Inactive (30 days): ${inactiveCustomers.length}\n` +
      `Abandoned Carts: ${abandonedCarts.length}\n\n` +
      `*Top 5 Customers:*\n`;

    topCustomers.forEach((customer, index) => {
      message += 
        `${index + 1}. ${customer.name || customer.phone}\n` +
        `   Spent: ₦${customer.totalSpent.toLocaleString()} | Orders: ${customer.totalOrders}\n`;
    });

    await sendMessage(jid, message);

  } catch (error) {
    logger.error('Customer stats error:', error);
    await sendMessage(jid, "Error retrieving customer statistics.");
  }
};

/**
 * Send products list
 */
const sendProductsList = async (jid) => {
  try {
    const products = await Product.find()
      .sort('-createdAt')
      .limit(20);

    if (products.length === 0) {
      await sendMessage(jid, "No products found.");
      return;
    }

    let message = `📦 *PRODUCTS* (${products.length})\n\n`;

    products.forEach(product => {
      const stockStatus = product.stock > 0 ? `✅ ${product.stock}` : '❌ Out';
      message += 
        `*${product.productId}* - ${product.name}\n` +
        `Price: ₦${product.price.toLocaleString()} | Stock: ${stockStatus}\n` +
        `Category: ${product.category} | Orders: ${product.metrics.orders}\n` +
        `─────────────\n`;
    });

    await sendMessage(jid, message);

  } catch (error) {
    logger.error('Products list error:', error);
    await sendMessage(jid, "Error retrieving products.");
  }
};

/**
 * Send broadcast instructions
 */
const sendBroadcastInstructions = async (jid) => {
  const message = 
    `📢 *BROADCAST MESSAGE*\n\n` +
    `To send a message to all customers:\n\n` +
    `BROADCAST\n` +
    `Your message here...\n\n` +
    `To send to VIP customers only:\n\n` +
    `BROADCAST VIP\n` +
    `Your exclusive message...\n\n` +
    `⚠️ Use broadcasts responsibly to avoid spam complaints.`;

  await sendMessage(jid, message);
};

export default {
  handleAdminCommand
};
