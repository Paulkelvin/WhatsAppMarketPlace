import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: 'text' // For text search
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['smartphones', 'laptops', 'accessories', 'smartwatches', 'tablets', 'audio', 'gaming', 'cameras'],
    index: true
  },
  images: [{
    url: String,
    publicId: String, // Cloudinary public ID for deletion
    isPrimary: Boolean
  }],
  specifications: {
    brand: String,
    model: String,
    warranty: String,
    features: [String],
    condition: {
      type: String,
      enum: ['new', 'refurbished', 'used'],
      default: 'new'
    }
  },
  pricing: {
    cost: Number, // Cost price for margin calculation
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    finalPrice: Number // Calculated: price - (price * discount/100)
  },
  inventory: {
    sku: String,
    location: String,
    reorderLevel: {
      type: Number,
      default: 5
    },
    lastRestocked: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out-of-stock', 'discontinued'],
    default: 'active'
  },
  metrics: {
    views: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },
  seo: {
    keywords: [String],
    tags: [String]
  },
  featured: {
    type: Boolean,
    default: false
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

// Indexes for performance
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'metrics.orders': -1 });
productSchema.index({ featured: -1, createdAt: -1 });

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'Out of Stock';
  if (this.stock <= this.inventory.reorderLevel) return 'Low Stock';
  return 'In Stock';
});

// Calculate final price before saving
productSchema.pre('save', function(next) {
  if (this.pricing.discount > 0) {
    this.pricing.finalPrice = this.price - (this.price * this.pricing.discount / 100);
  } else {
    this.pricing.finalPrice = this.price;
  }
  this.updatedAt = Date.now();
  next();
});

// Methods
productSchema.methods.updateStock = function(quantity, operation = 'subtract') {
  if (operation === 'subtract') {
    this.stock = Math.max(0, this.stock - quantity);
  } else {
    this.stock += quantity;
  }
  
  if (this.stock === 0) {
    this.status = 'out-of-stock';
  } else if (this.status === 'out-of-stock' && this.stock > 0) {
    this.status = 'active';
  }
  
  return this.save();
};

productSchema.methods.incrementMetrics = function(metric, value = 1) {
  this.metrics[metric] += value;
  return this.save();
};

// Static methods
productSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: 'active' }).sort('-featured -createdAt');
};

productSchema.statics.searchProducts = function(query) {
  return this.find(
    { $text: { $search: query }, status: 'active' },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

productSchema.statics.getFeatured = function(limit = 5) {
  return this.find({ featured: true, status: 'active' })
    .limit(limit)
    .sort('-createdAt');
};

productSchema.statics.getBestSellers = function(limit = 5) {
  return this.find({ status: 'active' })
    .sort('-metrics.orders')
    .limit(limit);
};

productSchema.statics.getLowStock = function() {
  return this.find({
    $expr: { $lte: ['$stock', '$inventory.reorderLevel'] },
    status: { $ne: 'discontinued' }
  });
};

const Product = mongoose.model('Product', productSchema);

export default Product;
