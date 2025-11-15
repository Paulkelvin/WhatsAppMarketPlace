import pino from 'pino';
import { sendMessage, sendImageMessage } from '../bot.js';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import Customer from '../../models/Customer.js';
import { businessConfig, getDeliveryFee, isFreeDelivery } from '../../config/business.js';

const logger = pino();

// Store pending orders temporarily (use Redis in production)
const pendingOrders = new Map();

/**
 * Handle order placement workflow
 * @param {Object} sock - WhatsApp socket
 * @param {string} jid - Customer WhatsApp JID
 * @param {Object} customer - Customer object
 * @param {Object} aiResponse - AI response with order intent
 */
export const handleOrderPlacement = async (sock, jid, customer, aiResponse) => {
  try {
    const phone = jid.replace('@s.whatsapp.net', '');

    // Check if we have order intent
    if (!aiResponse.orderIntent || !aiResponse.orderIntent.productId) {
      await sendMessage(jid, aiResponse.message);
      return;
    }

    // Get product details
    const product = await Product.findOne({
      productId: aiResponse.orderIntent.productId,
      status: 'active'
    });

    if (!product) {
      await sendMessage(jid, "I'm sorry, that product is not available right now. Would you like to see similar items? 🔍");
      return;
    }

    // Check stock
    const requestedQty = aiResponse.orderIntent.quantity || 1;
    if (product.stock < requestedQty) {
      await sendMessage(
        jid,
        `Unfortunately, we only have ${product.stock} unit(s) of *${product.name}* in stock right now. ` +
        `Would you like to order what's available? 📦`
      );
      return;
    }

    // Check if customer needs to provide delivery info
    const needsAddress = !customer.addresses || customer.addresses.length === 0;
    
    if (needsAddress) {
      await requestDeliveryInfo(jid, customer, product, requestedQty);
    } else {
      await confirmOrder(jid, customer, product, requestedQty);
    }

  } catch (error) {
    logger.error('Order placement error:', error);
    await sendMessage(jid, "I'm having trouble processing your order. Please try again or contact support. 🙏");
  }
};

/**
 * Request delivery information from customer
 */
const requestDeliveryInfo = async (jid, customer, product, quantity) => {
  try {
    const phone = jid.replace('@s.whatsapp.net', '');

    // Store pending order
    pendingOrders.set(phone, {
      product: product.toObject(),
      quantity,
      stage: 'awaiting_address',
      timestamp: Date.now()
    });

    const message = 
      `Great choice! 🎉\n\n` +
      `*${product.name}*\n` +
      `Quantity: ${quantity}\n` +
      `Price: ₦${(product.price * quantity).toLocaleString()}\n\n` +
      `To complete your order, I need your delivery details:\n\n` +
      `Please provide:\n` +
      `1️⃣ Full delivery address\n` +
      `2️⃣ City\n` +
      `3️⃣ State\n` +
      `4️⃣ Landmark (optional)\n\n` +
      `Example:\n` +
      `"15 Admiralty Way, Lekki, Lagos, Near Landmark Beach"\n\n` +
      `Please send your address now 📍`;

    await sendMessage(jid, message);
  } catch (error) {
    logger.error('Request delivery info error:', error);
  }
};

/**
 * Confirm order with customer
 */
const confirmOrder = async (jid, customer, product, quantity) => {
  try {
    const phone = jid.replace('@s.whatsapp.net', '');
    const address = customer.getDefaultAddress();

    if (!address || !address.state) {
      await requestDeliveryInfo(jid, customer, product, quantity);
      return;
    }

    // Calculate delivery fee
    const deliveryInfo = getDeliveryFee(address.state);
    const subtotal = product.price * quantity;
    const deliveryFee = isFreeDelivery(subtotal) ? 0 : deliveryInfo.fee;
    const total = subtotal + deliveryFee;

    // Store pending order
    pendingOrders.set(phone, {
      product: product.toObject(),
      quantity,
      address,
      deliveryInfo,
      pricing: { subtotal, deliveryFee, total },
      stage: 'awaiting_confirmation',
      timestamp: Date.now()
    });

    // Create confirmation message
    const freeDeliveryNote = deliveryFee === 0 
      ? `\n🎁 *FREE DELIVERY!* (Order over ₦${businessConfig.pricing.freeDeliveryMinimum.toLocaleString()})` 
      : '';

    const confirmationMessage = 
      `📋 *ORDER SUMMARY*\n\n` +
      `*Product:* ${product.name}\n` +
      `*Quantity:* ${quantity}\n` +
      `*Unit Price:* ₦${product.price.toLocaleString()}\n` +
      `*Subtotal:* ₦${subtotal.toLocaleString()}\n` +
      `*Delivery Fee:* ₦${deliveryFee.toLocaleString()}${freeDeliveryNote}\n` +
      `*TOTAL:* ₦${total.toLocaleString()}\n\n` +
      `📍 *Delivery Address:*\n` +
      `${address.street}, ${address.city}, ${address.state}\n` +
      `${address.landmark ? `Landmark: ${address.landmark}\n` : ''}` +
      `\n⏱️ *Estimated Delivery:* ${deliveryInfo.estimatedDays}\n\n` +
      `💳 *Payment Options:*\n` +
      `1. Cash on Delivery\n` +
      `2. Bank Transfer (Pay now via Paystack)\n\n` +
      `To confirm, reply with:\n` +
      `✅ "CONFIRM COD" for Cash on Delivery\n` +
      `✅ "CONFIRM TRANSFER" for Bank Transfer\n\n` +
      `Or reply "CANCEL" to cancel this order.`;

    // Send product image with confirmation
    if (product.images && product.images.length > 0) {
      await sendImageMessage(jid, product.images[0].url, confirmationMessage);
    } else {
      await sendMessage(jid, confirmationMessage);
    }

  } catch (error) {
    logger.error('Order confirmation error:', error);
  }
};

/**
 * Process confirmed order
 */
export const processConfirmedOrder = async (jid, customer, paymentMethod) => {
  try {
    const phone = jid.replace('@s.whatsapp.net', '');
    const pendingOrder = pendingOrders.get(phone);

    if (!pendingOrder || pendingOrder.stage !== 'awaiting_confirmation') {
      await sendMessage(jid, "I don't have a pending order for you. Would you like to start a new order? 🛒");
      return;
    }

    // Generate order ID
    const orderId = await Order.generateOrderId();

    // Create order object
    const orderData = {
      orderId,
      customer: {
        phone: customer.phone,
        name: customer.name,
        email: customer.email
      },
      items: [{
        productId: pendingOrder.product.productId,
        name: pendingOrder.product.name,
        price: pendingOrder.product.price,
        quantity: pendingOrder.quantity,
        image: pendingOrder.product.images?.[0]?.url
      }],
      pricing: pendingOrder.pricing,
      delivery: {
        address: pendingOrder.address,
        zone: pendingOrder.deliveryInfo.zone,
        estimatedDays: pendingOrder.deliveryInfo.estimatedDays
      },
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'transfer' ? 'pending' : 'pending'
      },
      status: 'pending'
    };

    // Save order to database
    const order = await Order.create(orderData);

    // Update product stock
    const product = await Product.findOne({ productId: pendingOrder.product.productId });
    await product.updateStock(pendingOrder.quantity);
    await product.incrementMetrics('orders', pendingOrder.quantity);

    // Update customer
    await customer.addOrder(orderId, pendingOrder.pricing.total);
    await customer.clearCart();

    // Clear pending order
    pendingOrders.delete(phone);

    // Send confirmation
    if (paymentMethod === 'transfer') {
      await sendPaymentLink(jid, order);
    } else {
      await sendOrderConfirmation(jid, order);
    }

    // Notify admin
    await notifyAdminNewOrder(order);

    logger.info(`Order ${orderId} created successfully for ${phone}`);

  } catch (error) {
    logger.error('Process order error:', error);
    await sendMessage(jid, "There was an error processing your order. Please try again or contact support. 🙏");
  }
};

/**
 * Send payment link for bank transfer
 */
const sendPaymentLink = async (jid, order) => {
  try {
    // In production, integrate with Paystack API
    const paystackLink = `https://paystack.com/pay/${order.orderId}`; // Mock link

    const message = 
      `✅ *Order Confirmed!*\n\n` +
      `Order ID: *${order.orderId}*\n` +
      `Total: *₦${order.pricing.total.toLocaleString()}*\n\n` +
      `💳 *Payment Instructions:*\n` +
      `1. Click the link below to pay securely\n` +
      `2. Complete payment within 24 hours\n` +
      `3. Your order will ship immediately after payment\n\n` +
      `🔗 *Payment Link:*\n` +
      `${paystackLink}\n\n` +
      `*OR* Bank Transfer Details:\n` +
      `Bank: GTBank\n` +
      `Account: 0123456789\n` +
      `Name: TechHub Nigeria\n\n` +
      `After payment, send your payment reference.\n\n` +
      `Thank you for shopping with us! 🎉`;

    await sendMessage(jid, message);
  } catch (error) {
    logger.error('Payment link error:', error);
  }
};

/**
 * Send order confirmation for COD
 */
const sendOrderConfirmation = async (jid, order) => {
  try {
    const message = 
      `✅ *Order Confirmed!*\n\n` +
      `Order ID: *${order.orderId}*\n` +
      `Total: *₦${order.pricing.total.toLocaleString()}*\n\n` +
      `📦 *Order Details:*\n` +
      order.items.map(item => 
        `• ${item.name} x${item.quantity} - ₦${item.price.toLocaleString()}`
      ).join('\n') + `\n\n` +
      `📍 *Delivery To:*\n` +
      `${order.delivery.address.street}\n` +
      `${order.delivery.address.city}, ${order.delivery.address.state}\n\n` +
      `💳 *Payment:* Cash on Delivery\n` +
      `⏱️ *Estimated Delivery:* ${order.delivery.estimatedDays}\n\n` +
      `We'll notify you when your order is ready for delivery!\n\n` +
      `To track your order, reply with "Track ${order.orderId}"\n\n` +
      `Thank you for shopping with ${businessConfig.name}! 🎉`;

    await sendMessage(jid, message);
  } catch (error) {
    logger.error('Order confirmation error:', error);
  }
};

/**
 * Notify admin about new order
 */
const notifyAdminNewOrder = async (order) => {
  try {
    const adminPhone = process.env.ADMIN_PHONE;
    if (!adminPhone) return;

    const message = 
      `🛒 *NEW ORDER RECEIVED!*\n\n` +
      `Order ID: ${order.orderId}\n` +
      `Customer: ${order.customer.name || order.customer.phone}\n` +
      `Items: ${order.items.length}\n` +
      `Total: ₦${order.pricing.total.toLocaleString()}\n` +
      `Payment: ${order.payment.method === 'cod' ? 'COD' : 'Transfer'}\n` +
      `Location: ${order.delivery.address.state}\n\n` +
      `Reply "!orders" to view all pending orders.`;

    await sendMessage(adminPhone, message);
  } catch (error) {
    logger.error('Admin notification error:', error);
  }
};

export default {
  handleOrderPlacement,
  processConfirmedOrder
};
