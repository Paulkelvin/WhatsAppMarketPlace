/**
 * Business Configuration
 * TechHub Nigeria - Electronics & Gadgets Marketplace
 */

export const businessConfig = {
  // Business Information
  name: process.env.BUSINESS_NAME || 'TechHub Nigeria',
  tagline: 'Your Trusted Electronics Partner',
  phone: process.env.BUSINESS_PHONE || '+234XXXXXXXXXX',
  email: process.env.BUSINESS_EMAIL || 'support@techhub.ng',
  website: 'https://techhub.ng',
  
  // Business Hours
  hours: {
    weekdays: '9:00 AM - 7:00 PM (Mon-Fri)',
    saturday: '10:00 AM - 6:00 PM',
    sunday: 'Closed',
    display: 'Mon-Fri: 9AM-7PM | Sat: 10AM-6PM'
  },

  // Location & Coverage
  location: {
    country: 'Nigeria',
    currency: '₦',
    currencyCode: 'NGN',
    nationwide: true
  },

  // Delivery Configuration (Nigerian States)
  deliveryZones: [
    {
      zone: 'Lagos & Abuja (Major Cities)',
      states: ['Lagos', 'Abuja'],
      fee: 2000,
      estimatedDays: '1-2 days',
      description: 'Express delivery to major cities'
    },
    {
      zone: 'South-West Region',
      states: ['Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti'],
      fee: 3000,
      estimatedDays: '2-3 days',
      description: 'Fast delivery to South-West'
    },
    {
      zone: 'South-South & South-East',
      states: ['Rivers', 'Delta', 'Edo', 'Akwa Ibom', 'Cross River', 'Bayelsa', 'Anambra', 'Enugu', 'Abia', 'Imo', 'Ebonyi'],
      fee: 3500,
      estimatedDays: '2-3 days',
      description: 'Reliable delivery to Southern regions'
    },
    {
      zone: 'North-Central Region',
      states: ['Kogi', 'Kwara', 'Niger', 'Benue', 'Plateau', 'Nasarawa'],
      fee: 4000,
      estimatedDays: '2-3 days',
      description: 'Secure delivery to North-Central'
    },
    {
      zone: 'North-West & North-East',
      states: ['Kaduna', 'Kano', 'Katsina', 'Sokoto', 'Kebbi', 'Zamfara', 'Jigawa', 'Bauchi', 'Gombe', 'Borno', 'Yobe', 'Adamawa', 'Taraba'],
      fee: 5000,
      estimatedDays: '3-4 days',
      description: 'Nationwide coverage to Northern states'
    }
  ],

  // Payment Methods
  paymentMethods: [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      enabled: true,
      note: 'Delivery fee paid on delivery + product cost'
    },
    {
      id: 'transfer',
      name: 'Bank Transfer (Paystack)',
      description: 'Secure online payment',
      enabled: true,
      note: 'Pay online via Paystack - instant confirmation'
    }
  ],

  // Pricing & Fees
  pricing: {
    freeDeliveryMinimum: 100000, // Free delivery on orders above ₦100,000
    taxRate: 0, // No VAT on electronics in Nigeria currently
    bulkDiscounts: [
      { minQuantity: 3, discount: 0.05, description: '5% off on 3+ items' },
      { minQuantity: 5, discount: 0.08, description: '8% off on 5+ items' }
    ]
  },

  // Policies
  policies: {
    returns: {
      period: '7 days',
      conditions: 'Unopened packaging, original condition, with receipt',
      process: 'Contact support to initiate return'
    },
    warranty: {
      standard: '6 months warranty on all products',
      extended: 'Extended warranty available for purchase',
      covers: 'Manufacturing defects only'
    },
    refunds: {
      method: 'Bank transfer or store credit',
      timeframe: '5-7 business days',
      deductions: 'Return shipping may be deducted'
    },
    cancellation: {
      allowed: true,
      deadline: 'Before item ships',
      fullRefund: true
    },
    exchange: {
      allowed: true,
      period: '14 days',
      conditions: 'Product must be unused and in original packaging'
    }
  },

  // Product Categories
  categories: [
    { id: 'smartphones', name: 'Smartphones', icon: '📱' },
    { id: 'laptops', name: 'Laptops & Computers', icon: '💻' },
    { id: 'accessories', name: 'Accessories', icon: '🎧' },
    { id: 'smartwatches', name: 'Smart Watches', icon: '⌚' },
    { id: 'tablets', name: 'Tablets', icon: '📱' },
    { id: 'audio', name: 'Audio Devices', icon: '🔊' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'cameras', name: 'Cameras', icon: '📷' }
  ],

  // AI Behavior Configuration
  ai: {
    tone: 'friendly-professional', // Mix of casual, friendly, and professional
    language: 'en', // English only
    useEmojis: 'moderate', // Use emojis but not excessively
    
    salesApproach: {
      proactive: true,
      suggestProducts: true,
      crossSell: true,
      upSell: true,
      followUpAbandoned: true,
      maxFollowUps: 2
    },

    negotiation: {
      allowNegotiation: false,
      message: 'Our prices are fixed to ensure quality and fairness. However, we offer bulk discounts and regular promotions!'
    },

    escalation: {
      conditions: [
        'refund_request',
        'serious_complaint',
        'technical_issue',
        'damaged_product',
        'delivery_problem',
        'payment_failure'
      ],
      responseTime: '2 hours during business hours',
      urgentContact: process.env.ADMIN_PHONE
    },

    features: {
      productRecommendations: true,
      naturalLanguageOrders: true,
      multilingual: false, // English only for now
      sentimentAnalysis: true,
      contextAwareness: true
    }
  },

  // Admin Configuration
  admin: {
    phone: process.env.ADMIN_PHONE,
    commands: {
      prefix: '!',
      available: [
        '!addproduct',
        '!updatestock',
        '!orders',
        '!analytics',
        '!broadcast',
        '!help'
      ]
    },
    webDashboard: {
      enabled: true,
      url: process.env.VERCEL_URL || 'http://localhost:3000/admin'
    }
  },

  // Social Media
  social: {
    instagram: '@techhub_ng',
    twitter: '@techhub_ng',
    facebook: 'TechHubNigeria'
  }
};

// Helper function to get delivery fee by state
export function getDeliveryFee(state) {
  for (const zone of businessConfig.deliveryZones) {
    if (zone.states.includes(state)) {
      return {
        fee: zone.fee,
        estimatedDays: zone.estimatedDays,
        zone: zone.zone
      };
    }
  }
  // Default to highest fee if state not found
  return {
    fee: 5000,
    estimatedDays: '3-4 days',
    zone: 'Standard Delivery'
  };
}

// Helper function to check if delivery is free
export function isFreeDelivery(orderTotal) {
  return orderTotal >= businessConfig.pricing.freeDeliveryMinimum;
}

export default businessConfig;
