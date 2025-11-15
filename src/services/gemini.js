import { GoogleGenerativeAI } from '@google/generative-ai';
import pino from 'pino';
import { businessConfig } from '../config/business.js';

const logger = pino();

// Initialize Gemini AI
let genAI;
let model;

export const initializeGemini = () => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    logger.info('✅ Gemini AI initialized successfully');
    return true;
  } catch (error) {
    logger.error('❌ Gemini AI initialization failed:', error.message);
    return false;
  }
};

/**
 * Generate AI-powered customer response
 * @param {Object} context - Conversation context
 * @returns {Promise<Object>} AI response with action and message
 */
export const generateCustomerResponse = async (context) => {
  try {
    const {
      customerMessage,
      customer,
      availableProducts,
      activeOrders,
      conversationHistory
    } = context;

    const prompt = buildCustomerPrompt(
      customerMessage,
      customer,
      availableProducts,
      activeOrders,
      conversationHistory
    );

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Parse AI response (expecting JSON format)
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch {
      // If not JSON, wrap in default structure
      parsedResponse = {
        message: response,
        action: 'general_inquiry',
        requiresHuman: false,
        collectData: {}
      };
    }

    logger.info(`AI Response generated for intent: ${parsedResponse.action}`);
    return parsedResponse;

  } catch (error) {
    logger.error('AI response generation error:', error);
    
    // Fallback response
    return {
      message: "I'm here to help! Let me connect you with our support team for better assistance.",
      action: 'escalate',
      requiresHuman: true,
      collectData: {}
    };
  }
};

/**
 * Build prompt for customer interaction
 */
const buildCustomerPrompt = (message, customer, products, orders, history) => {
  const systemPrompt = `You are an intelligent WhatsApp marketplace assistant for ${businessConfig.name}. Your role is to help customers browse products, place orders, and provide exceptional customer service.

## Your Personality
- Tone: ${businessConfig.ai.tone} (Be friendly, professional, and helpful)
- Use emojis ${businessConfig.ai.useEmojis} to add warmth
- Keep responses concise but informative
- Be proactive in suggesting products

## Context
**Customer Information:**
${customer ? `
- Name: ${customer.name || 'New Customer'}
- Phone: ${customer.phone}
- Previous Orders: ${customer.totalOrders || 0}
- Total Spent: ₦${customer.totalSpent?.toLocaleString() || 0}
- VIP Status: ${customer.isVIP ? `Yes (${customer.vipTier})` : 'No'}
` : 'New customer, no history'}

**Available Products (Top 10):**
${products && products.length > 0 ? products.slice(0, 10).map(p => 
  `- ${p.name} | ₦${p.price.toLocaleString()} | Stock: ${p.stock} | Category: ${p.category}`
).join('\n') : 'No products available'}

**Active Orders:**
${orders && orders.length > 0 ? orders.map(o => 
  `- Order #${o.orderId} | Status: ${o.status} | Total: ₦${o.pricing.total.toLocaleString()}`
).join('\n') : 'No active orders'}

**Recent Conversation:**
${history && history.length > 0 ? history.slice(-3).map(h => 
  `${h.role}: ${h.message}`
).join('\n') : 'First interaction'}

## Business Information
- Name: ${businessConfig.name}
- Hours: ${businessConfig.hours.display}
- Location: ${businessConfig.location.country}
- Currency: ${businessConfig.location.currency}
- Payment: Cash on Delivery, Bank Transfer (Paystack)
- Delivery: Nationwide (₦2,000-₦5,000, 1-3 days)
- Free Delivery: Orders above ₦${businessConfig.pricing.freeDeliveryMinimum.toLocaleString()}

## Sales Approach
- ${businessConfig.ai.salesApproach.suggestProducts ? 'Proactively suggest relevant products' : 'Wait for customer to ask'}
- ${businessConfig.ai.salesApproach.crossSell ? 'Recommend complementary items' : 'Focus on main request'}
- Prices are fixed (no negotiation), but mention bulk discounts and promotions

## Response Guidelines
1. Identify customer intent (browse, order, track, support)
2. Provide relevant product information with prices
3. Guide through ordering process step-by-step
4. Always confirm order details before processing
5. Be helpful with delivery and payment questions
6. Escalate to human for: refunds, complaints, technical issues, damaged products

## Customer Message
"${message}"

## Your Task
Respond to the customer naturally and helpfully. Your response MUST be valid JSON in this exact format:
{
  "message": "Your friendly response here (use emojis moderately)",
  "action": "browse_products|place_order|track_order|escalate|general_inquiry",
  "requiresHuman": false,
  "collectData": {
    "needsAddress": false,
    "needsPayment": false,
    "needsConfirmation": false
  },
  "suggestedProducts": ["PRD-001", "PRD-002"],
  "orderIntent": {
    "productId": "PRD-001",
    "quantity": 1
  }
}

Important: Respond ONLY with valid JSON. No markdown formatting, no code blocks, just pure JSON.`;

  return systemPrompt;
};

/**
 * Generate product recommendations
 * @param {Object} customer - Customer data
 * @param {Array} products - Available products
 * @returns {Promise<Array>} Recommended product IDs
 */
export const generateProductRecommendations = async (customer, products) => {
  try {
    const prompt = `Based on this customer profile, recommend 3-5 products from the list:

Customer:
- Previous orders: ${customer.totalOrders || 0}
- Total spent: ₦${customer.totalSpent || 0}
- Favorite categories: ${customer.preferences?.favoriteCategories?.join(', ') || 'None yet'}
- VIP: ${customer.isVIP ? 'Yes' : 'No'}

Available Products:
${products.map(p => `${p.productId}: ${p.name} - ₦${p.price} (${p.category})`).join('\n')}

Respond with ONLY a JSON array of product IDs, like: ["PRD-001", "PRD-002", "PRD-003"]`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const productIds = JSON.parse(response.replace(/```json|```/g, '').trim());
    return productIds;

  } catch (error) {
    logger.error('Product recommendation error:', error);
    // Return random products as fallback
    return products.slice(0, 3).map(p => p.productId);
  }
};

/**
 * Detect order intent from natural language
 * @param {string} message - Customer message
 * @param {Array} products - Available products
 * @returns {Promise<Object>} Detected order intent
 */
export const detectOrderIntent = async (message, products) => {
  try {
    const prompt = `Analyze this customer message to detect if they want to order a product:

Message: "${message}"

Available Products:
${products.map(p => `${p.productId}: ${p.name}`).join('\n')}

If the customer wants to order, respond with JSON:
{
  "hasIntent": true,
  "productId": "PRD-XXX",
  "quantity": 1,
  "confidence": 0.95
}

If unclear or not an order intent:
{
  "hasIntent": false,
  "reason": "explanation"
}

Respond with ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    return JSON.parse(response.replace(/```json|```/g, '').trim());

  } catch (error) {
    logger.error('Order intent detection error:', error);
    return { hasIntent: false, reason: 'Detection failed' };
  }
};

/**
 * Generate abandoned cart follow-up message
 * @param {Object} customer - Customer data
 * @param {Array} cartItems - Items in cart
 * @returns {Promise<string>} Follow-up message
 */
export const generateCartFollowUp = async (customer, cartItems) => {
  try {
    const prompt = `Generate a friendly follow-up message for a customer who abandoned their cart.

Customer: ${customer.name || 'Valued customer'}
Cart Items: ${cartItems.map(i => i.name).join(', ')}
Total Value: ₦${cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toLocaleString()}

Create a short, encouraging message (2-3 lines) that:
- Reminds them about their cart
- Creates urgency (limited stock, special offer)
- Makes it easy to complete the order
- Sounds natural and friendly

Respond with just the message text, no JSON.`;

    const result = await model.generateContent(prompt);
    return result.response.text();

  } catch (error) {
    logger.error('Cart follow-up generation error:', error);
    return `Hi ${customer.name}! 👋 You left some items in your cart. Still interested? Let me know and I'll help you complete the order! 🛒`;
  }
};

/**
 * Check if Gemini is initialized
 * @returns {boolean} Initialization status
 */
export const isGeminiConfigured = () => {
  return !!(model && process.env.GEMINI_API_KEY);
};

export default {
  initializeGemini,
  generateCustomerResponse,
  generateProductRecommendations,
  detectOrderIntent,
  generateCartFollowUp,
  isGeminiConfigured
};
