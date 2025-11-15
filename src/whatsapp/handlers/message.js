import pino from 'pino';
import { sendMessage, sendImageMessage, sendTyping, markAsRead } from '../bot.js';
import { generateCustomerResponse, detectOrderIntent } from '../../services/gemini.js';
import Customer from '../../models/Customer.js';
import Product from '../../models/Product.js';
import Order from '../../models/Order.js';
import { businessConfig, getDeliveryFee, isFreeDelivery } from '../../config/business.js';
import { handleOrderPlacement } from './orders.js';
import { handleAdminCommand } from './admin.js';

const logger = pino();

// Store conversation state (in production, use Redis or database)
const conversationState = new Map();

/**
 * Handle incoming WhatsApp message
 * @param {Object} sock - WhatsApp socket
 * @param {Object} message - WhatsApp message object
 */
export const handleIncomingMessage = async (sock, message) => {
  try {
    // Extract message details
    const jid = message.key.remoteJid;
    const phone = jid.replace('@s.whatsapp.net', '');
    const messageText = message.message?.conversation || 
                       message.message?.extendedTextMessage?.text || 
                       '';

    // Ignore empty messages
    if (!messageText.trim()) return;

    logger.info(`📨 Message from ${phone}: ${messageText}`);

    // Mark as read
    await markAsRead(jid, message.key);

    // Check if it's an admin command
    if (phone === process.env.ADMIN_PHONE?.replace('+', '') && messageText.startsWith('!')) {
      await handleAdminCommand(sock, jid, messageText);
      return;
    }

    // Show typing indicator
    await sendTyping(jid, true);

    // Get or create customer
    const customer = await Customer.findOrCreate(phone);

    // Get conversation context
    const context = await buildConversationContext(customer, messageText);

    // Generate AI response
    const aiResponse = await generateCustomerResponse(context);

    // Stop typing
    await sendTyping(jid, false);

    // Handle different actions
    switch (aiResponse.action) {
      case 'browse_products':
        await handleBrowseProducts(jid, customer, aiResponse);
        break;

      case 'place_order':
        await handleOrderPlacement(sock, jid, customer, aiResponse);
        break;

      case 'track_order':
        await handleTrackOrder(jid, customer, aiResponse);
        break;

      case 'escalate':
        await handleEscalation(jid, customer, messageText);
        break;

      case 'general_inquiry':
      default:
        await sendMessage(jid, aiResponse.message);
        break;
    }

    // Update customer interaction
    await customer.updateInteraction(aiResponse.action, messageText);

    // Store conversation state
    updateConversationState(phone, aiResponse);

  } catch (error) {
    logger.error('Message handling error:', error);
    
    // Send error message to customer
    try {
      await sendMessage(
        message.key.remoteJid,
        "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or contact our support team. 🙏"
      );
    } catch (sendError) {
      logger.error('Failed to send error message:', sendError);
    }
  }
};

/**
 * Build conversation context for AI
 */
const buildConversationContext = async (customer, messageText) => {
  try {
    // Get available products
    const products = await Product.find({ status: 'active' })
      .sort('-featured -metrics.orders')
      .limit(20)
      .select('productId name price stock category description');

    // Get active orders for this customer
    const orders = await Order.find({
      'customer.phone': customer.phone,
      status: { $in: ['pending', 'confirmed', 'processing', 'shipped'] }
    }).sort('-createdAt').limit(5);

    // Get conversation history from state
    const history = conversationState.get(customer.phone)?.history || [];

    return {
      customerMessage: messageText,
      customer: customer.toObject(),
      availableProducts: products,
      activeOrders: orders,
      conversationHistory: history,
      businessInfo: businessConfig
    };
  } catch (error) {
    logger.error('Error building context:', error);
    return {
      customerMessage: messageText,
      customer: customer.toObject(),
      availableProducts: [],
      activeOrders: [],
      conversationHistory: [],
      businessInfo: businessConfig
    };
  }
};

/**
 * Handle product browsing
 */
const handleBrowseProducts = async (jid, customer, aiResponse) => {
  try {
    // Send AI message
    await sendMessage(jid, aiResponse.message);

    // If there are suggested products, show them with images
    if (aiResponse.suggestedProducts && aiResponse.suggestedProducts.length > 0) {
      const products = await Product.find({
        productId: { $in: aiResponse.suggestedProducts }
      }).limit(5);

      for (const product of products) {
        const productMessage = formatProductMessage(product);
        
        if (product.images && product.images.length > 0) {
          await sendImageMessage(jid, product.images[0].url, productMessage);
        } else {
          await sendMessage(jid, productMessage);
        }

        // Small delay between products
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Increment view metrics
      products.forEach(p => p.incrementMetrics('views'));
    }
  } catch (error) {
    logger.error('Browse products error:', error);
    await sendMessage(jid, "I'm having trouble showing products right now. Please try again! 😊");
  }
};

/**
 * Handle order tracking
 */
const handleTrackOrder = async (jid, customer, aiResponse) => {
  try {
    // Send AI response
    await sendMessage(jid, aiResponse.message);

    // Get recent orders
    const recentOrders = await Order.find({ 'customer.phone': customer.phone })
      .sort('-createdAt')
      .limit(3);

    if (recentOrders.length > 0) {
      for (const order of recentOrders) {
        const orderMessage = formatOrderStatus(order);
        await sendMessage(jid, orderMessage);
        
        // Small delay between orders
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
  } catch (error) {
    logger.error('Track order error:', error);
    await sendMessage(jid, "I couldn't retrieve your order information. Please contact support. 📞");
  }
};

/**
 * Handle escalation to human support
 */
const handleEscalation = async (jid, customer, originalMessage) => {
  try {
    // Notify customer
    await sendMessage(
      jid,
      `I understand this requires personal attention. I'm connecting you with our support team right away! 👤\n\n` +
      `They'll respond within ${businessConfig.ai.escalation.responseTime}.\n\n` +
      `Support: ${businessConfig.phone}\n` +
      `Email: ${businessConfig.email}`
    );

    // Notify admin
    const adminPhone = process.env.ADMIN_PHONE;
    if (adminPhone) {
      const adminNotification = 
        `🚨 *CUSTOMER NEEDS ASSISTANCE*\n\n` +
        `From: ${customer.name || customer.phone}\n` +
        `Phone: ${customer.phone}\n` +
        `VIP: ${customer.isVIP ? 'Yes' : 'No'}\n\n` +
        `Message: "${originalMessage}"\n\n` +
        `Please respond ASAP!`;

      await sendMessage(adminPhone, adminNotification);
    }
  } catch (error) {
    logger.error('Escalation error:', error);
  }
};

/**
 * Format product message
 */
const formatProductMessage = (product) => {
  const stockStatus = product.stock > 0 ? `✅ In Stock (${product.stock})` : '❌ Out of Stock';
  const discount = product.pricing?.discount > 0 
    ? `\n💰 Discount: ${product.pricing.discount}% OFF!` 
    : '';

  return `*${product.name}*\n\n` +
         `💵 Price: ₦${product.price.toLocaleString()}\n` +
         `📦 ${stockStatus}\n` +
         `🏷️ Category: ${product.category}${discount}\n\n` +
         `${product.description}\n\n` +
         `To order, just say "I want ${product.name}" 🛒`;
};

/**
 * Format order status message
 */
const formatOrderStatus = (order) => {
  const statusEmoji = {
    pending: '⏳',
    confirmed: '✅',
    processing: '📦',
    shipped: '🚚',
    delivered: '🎉',
    cancelled: '❌'
  };

  return `${statusEmoji[order.status]} *Order #${order.orderId}*\n\n` +
         `Status: ${order.status.toUpperCase()}\n` +
         `Items: ${order.items.length} item(s)\n` +
         `Total: ₦${order.pricing.total.toLocaleString()}\n` +
         `Date: ${order.createdAt.toLocaleDateString('en-NG')}\n` +
         `Payment: ${order.payment.method === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}\n\n` +
         (order.delivery.estimatedDays ? `📅 Estimated: ${order.delivery.estimatedDays}\n` : '');
};

/**
 * Update conversation state
 */
const updateConversationState = (phone, aiResponse) => {
  const currentState = conversationState.get(phone) || { history: [] };
  
  currentState.history.push({
    role: 'user',
    message: aiResponse.message,
    timestamp: new Date()
  });

  // Keep only last 10 messages
  if (currentState.history.length > 10) {
    currentState.history = currentState.history.slice(-10);
  }

  currentState.lastAction = aiResponse.action;
  currentState.lastUpdate = new Date();

  conversationState.set(phone, currentState);
};

export default handleIncomingMessage;
