import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  addresses: [{
    label: String, // 'home', 'office', etc.
    street: String,
    city: String,
    state: String,
    landmark: String,
    isDefault: Boolean,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  orderHistory: [{
    orderId: String,
    total: Number,
    date: Date,
    status: String
  }],
  totalSpent: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  preferences: {
    favoriteCategories: [String],
    priceRange: {
      min: Number,
      max: Number
    },
    notificationsEnabled: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  cart: [{
    productId: String,
    quantity: Number,
    addedAt: Date
  }],
  isVIP: {
    type: Boolean,
    default: false
  },
  vipTier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', null],
    default: null
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active'
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  },
  conversationContext: {
    lastMessage: String,
    lastIntent: String,
    pendingAction: String,
    sessionData: mongoose.Schema.Types.Mixed
  },
  metadata: {
    source: String, // How they found us
    referredBy: String,
    tags: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
customerSchema.index({ totalSpent: -1 });
customerSchema.index({ isVIP: 1 });
customerSchema.index({ lastInteraction: -1 });
customerSchema.index({ 'addresses.state': 1 });

// Virtual for display name
customerSchema.virtual('displayName').get(function() {
  return this.name || this.phone.replace(/(\+234)(\d{3})(\d{3})(\d{4})/, '$1 $2 *** $4');
});

// Update VIP status based on spending
customerSchema.pre('save', function(next) {
  // VIP tiers based on total spending
  if (this.totalSpent >= 500000) {
    this.isVIP = true;
    this.vipTier = 'platinum';
  } else if (this.totalSpent >= 300000) {
    this.isVIP = true;
    this.vipTier = 'gold';
  } else if (this.totalSpent >= 150000) {
    this.isVIP = true;
    this.vipTier = 'silver';
  } else if (this.totalSpent >= 50000) {
    this.isVIP = true;
    this.vipTier = 'bronze';
  }
  
  this.updatedAt = Date.now();
  next();
});

// Methods
customerSchema.methods.addToCart = function(productId, quantity = 1) {
  const existingItem = this.cart.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.cart.push({
      productId,
      quantity,
      addedAt: new Date()
    });
  }
  
  return this.save();
};

customerSchema.methods.clearCart = function() {
  this.cart = [];
  return this.save();
};

customerSchema.methods.addOrder = function(orderId, total, status = 'pending') {
  this.orderHistory.unshift({
    orderId,
    total,
    date: new Date(),
    status
  });
  
  this.totalOrders += 1;
  this.totalSpent += total;
  this.lastInteraction = new Date();
  
  // Award loyalty points (1 point per ₦100 spent)
  this.loyaltyPoints += Math.floor(total / 100);
  
  return this.save();
};

customerSchema.methods.updateInteraction = function(intent, message) {
  this.lastInteraction = new Date();
  this.conversationContext.lastIntent = intent;
  this.conversationContext.lastMessage = message;
  return this.save();
};

customerSchema.methods.addAddress = function(address) {
  // If this is the first address, make it default
  if (this.addresses.length === 0) {
    address.isDefault = true;
  }
  
  this.addresses.push(address);
  return this.save();
};

customerSchema.methods.getDefaultAddress = function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
};

// Static methods
customerSchema.statics.findOrCreate = async function(phone, name = null) {
  let customer = await this.findOne({ phone });
  
  if (!customer) {
    customer = await this.create({
      phone,
      name,
      lastInteraction: new Date()
    });
  } else {
    customer.lastInteraction = new Date();
    await customer.save();
  }
  
  return customer;
};

customerSchema.statics.getVIPCustomers = function() {
  return this.find({ isVIP: true, status: 'active' })
    .sort('-totalSpent');
};

customerSchema.statics.getInactiveCustomers = function(days = 30) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  return this.find({
    lastInteraction: { $lt: date },
    status: 'active'
  });
};

customerSchema.statics.getCustomersWithAbandonedCarts = function() {
  return this.find({
    'cart.0': { $exists: true },
    status: 'active'
  });
};

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
