import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customer: {
    phone: {
      type: String,
      required: true,
      index: true
    },
    name: String,
    email: String
  },
  items: [{
    productId: {
      type: String,
      required: true
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    subtotal: Number,
    image: String
  }],
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  delivery: {
    address: {
      street: String,
      city: String,
      state: {
        type: String,
        required: true
      },
      landmark: String
    },
    zone: String,
    estimatedDays: String,
    instructions: String,
    recipientName: String,
    recipientPhone: String
  },
  payment: {
    method: {
      type: String,
      enum: ['cod', 'transfer'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    reference: String, // Paystack reference
    paidAt: Date,
    amountPaid: Number
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: String // 'system', 'admin', or admin phone
  }],
  notes: {
    customer: String,
    admin: String,
    internal: String
  },
  metadata: {
    source: {
      type: String,
      default: 'whatsapp'
    },
    ipAddress: String,
    userAgent: String,
    sessionId: String
  },
  cancellation: {
    cancelled: {
      type: Boolean,
      default: false
    },
    reason: String,
    cancelledAt: Date,
    cancelledBy: String,
    refundIssued: Boolean
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date
});

// Indexes for performance
orderSchema.index({ 'customer.phone': 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ 'delivery.state': 1 });

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  // Calculate item subtotals
  this.items.forEach(item => {
    item.subtotal = item.price * item.quantity;
  });
  
  // Calculate order subtotal
  this.pricing.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  
  // Calculate final total
  this.pricing.total = this.pricing.subtotal + this.pricing.deliveryFee - this.pricing.discount;
  
  this.updatedAt = Date.now();
  next();
});

// Methods
orderSchema.methods.updateStatus = function(newStatus, note = '', updatedBy = 'system') {
  this.statusHistory.push({
    status: this.status,
    timestamp: new Date(),
    note: `Changed from ${this.status} to ${newStatus}. ${note}`,
    updatedBy
  });
  
  this.status = newStatus;
  
  // Update timestamps
  if (newStatus === 'confirmed') this.confirmedAt = new Date();
  if (newStatus === 'shipped') this.shippedAt = new Date();
  if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
    this.payment.status = 'paid';
    this.payment.paidAt = new Date();
  }
  
  return this.save();
};

orderSchema.methods.cancelOrder = function(reason, cancelledBy = 'customer') {
  this.cancellation = {
    cancelled: true,
    reason,
    cancelledAt: new Date(),
    cancelledBy,
    refundIssued: this.payment.status === 'paid'
  };
  
  this.status = 'cancelled';
  
  this.statusHistory.push({
    status: 'cancelled',
    timestamp: new Date(),
    note: `Order cancelled: ${reason}`,
    updatedBy: cancelledBy
  });
  
  return this.save();
};

orderSchema.methods.confirmPayment = function(reference, amount) {
  this.payment.status = 'paid';
  this.payment.reference = reference;
  this.payment.amountPaid = amount;
  this.payment.paidAt = new Date();
  
  return this.save();
};

orderSchema.methods.getFormattedOrder = function() {
  return {
    orderId: this.orderId,
    date: this.createdAt.toLocaleDateString('en-NG'),
    status: this.status,
    items: this.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: `₦${item.price.toLocaleString()}`
    })),
    total: `₦${this.pricing.total.toLocaleString()}`,
    delivery: {
      address: `${this.delivery.address.street}, ${this.delivery.address.city}, ${this.delivery.address.state}`,
      estimated: this.delivery.estimatedDays
    },
    payment: {
      method: this.payment.method === 'cod' ? 'Cash on Delivery' : 'Bank Transfer',
      status: this.payment.status
    }
  };
};

// Static methods
orderSchema.statics.generateOrderId = async function() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  // Find the last order today
  const lastOrder = await this.findOne({
    orderId: new RegExp(`^ORD-${year}${month}`)
  }).sort('-orderId');
  
  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderId.split('-')[2]);
    sequence = lastSequence + 1;
  }
  
  return `ORD-${year}${month}-${sequence.toString().padStart(4, '0')}`;
};

orderSchema.statics.getRecentOrders = function(limit = 10) {
  return this.find()
    .sort('-createdAt')
    .limit(limit);
};

orderSchema.statics.getOrdersByStatus = function(status) {
  return this.find({ status })
    .sort('-createdAt');
};

orderSchema.statics.getCustomerOrders = function(phone) {
  return this.find({ 'customer.phone': phone })
    .sort('-createdAt');
};

orderSchema.statics.getPendingOrders = function() {
  return this.find({
    status: { $in: ['pending', 'confirmed', 'processing'] }
  }).sort('createdAt');
};

orderSchema.statics.getDailyRevenue = async function(date = new Date()) {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  const result = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$pricing.total' },
        orderCount: { $sum: 1 }
      }
    }
  ]);
  
  return result[0] || { totalRevenue: 0, orderCount: 0 };
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
