/**
 * Sample Products Data for TechHub Nigeria
 * This file contains pseudo product data for development and testing
 */

export const sampleProducts = [
  {
    productId: 'PRD-001',
    name: 'iPhone 15 Pro Max 256GB',
    description: 'Latest Apple flagship with A17 Pro chip, titanium design, and advanced camera system. Brand new, factory sealed with full warranty.',
    price: 1450000,
    stock: 8,
    category: 'smartphones',
    images: [],
    specifications: {
      brand: 'Apple',
      model: 'iPhone 15 Pro Max',
      warranty: '1 year Apple warranty',
      features: ['A17 Pro chip', '256GB storage', '6.7" display', '48MP camera', '5G'],
      condition: 'new'
    },
    pricing: {
      cost: 1300000,
      discount: 0
    },
    inventory: {
      sku: 'APL-IP15PM-256',
      reorderLevel: 3
    },
    featured: true,
    status: 'active'
  },
  {
    productId: 'PRD-002',
    name: 'Samsung Galaxy S24 Ultra 512GB',
    description: 'Premium Samsung flagship with S Pen, stunning AMOLED display, and exceptional camera capabilities. Comes with Galaxy Buds.',
    price: 1280000,
    stock: 12,
    category: 'smartphones',
    images: [],
    specifications: {
      brand: 'Samsung',
      model: 'Galaxy S24 Ultra',
      warranty: '1 year Samsung warranty',
      features: ['Snapdragon 8 Gen 3', '512GB storage', 'S Pen included', '200MP camera', '5G'],
      condition: 'new'
    },
    pricing: {
      cost: 1150000,
      discount: 5
    },
    inventory: {
      sku: 'SAM-S24U-512',
      reorderLevel: 5
    },
    featured: true,
    status: 'active'
  },
  {
    productId: 'PRD-003',
    name: 'MacBook Pro 14" M3 Pro 16GB/512GB',
    description: 'Powerful Apple MacBook Pro with M3 Pro chip. Perfect for professionals and creators. Stunning Liquid Retina XDR display.',
    price: 2850000,
    stock: 5,
    category: 'laptops',
    images: [],
    specifications: {
      brand: 'Apple',
      model: 'MacBook Pro 14"',
      warranty: '1 year Apple warranty',
      features: ['M3 Pro chip', '16GB RAM', '512GB SSD', '14" Liquid Retina XDR', 'macOS Sonoma'],
      condition: 'new'
    },
    pricing: {
      cost: 2600000,
      discount: 0
    },
    inventory: {
      sku: 'APL-MBP14-M3P',
      reorderLevel: 2
    },
    featured: true,
    status: 'active'
  },
  {
    productId: 'PRD-004',
    name: 'Dell XPS 15 Intel i7 16GB/1TB',
    description: 'Premium Windows laptop with stunning 4K display, powerful performance, and sleek design. Perfect for work and entertainment.',
    price: 1850000,
    stock: 7,
    category: 'laptops',
    images: [],
    specifications: {
      brand: 'Dell',
      model: 'XPS 15',
      warranty: '1 year Dell warranty',
      features: ['Intel i7-13700H', '16GB RAM', '1TB SSD', '15.6" 4K OLED', 'Windows 11 Pro'],
      condition: 'new'
    },
    pricing: {
      cost: 1650000,
      discount: 0
    },
    inventory: {
      sku: 'DEL-XPS15-I7',
      reorderLevel: 3
    },
    featured: false,
    status: 'active'
  },
  {
    productId: 'PRD-005',
    name: 'Apple AirPods Pro 2nd Gen',
    description: 'Premium wireless earbuds with active noise cancellation, spatial audio, and MagSafe charging case. Crystal clear sound quality.',
    price: 185000,
    stock: 25,
    category: 'accessories',
    images: [],
    specifications: {
      brand: 'Apple',
      model: 'AirPods Pro (2nd Gen)',
      warranty: '1 year Apple warranty',
      features: ['Active Noise Cancellation', 'Spatial Audio', 'MagSafe case', 'Up to 6hrs battery'],
      condition: 'new'
    },
    pricing: {
      cost: 165000,
      discount: 0
    },
    inventory: {
      sku: 'APL-APP2-WHT',
      reorderLevel: 10
    },
    featured: true,
    status: 'active'
  },
  {
    productId: 'PRD-006',
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise cancelling headphones with exceptional sound quality. Premium comfort for long listening sessions.',
    price: 295000,
    stock: 15,
    category: 'audio',
    images: [],
    specifications: {
      brand: 'Sony',
      model: 'WH-1000XM5',
      warranty: '1 year Sony warranty',
      features: ['Premium ANC', '30hr battery', 'LDAC audio', 'Multipoint connection'],
      condition: 'new'
    },
    pricing: {
      cost: 260000,
      discount: 0
    },
    inventory: {
      sku: 'SNY-WH1000M5',
      reorderLevel: 8
    },
    featured: true,
    status: 'active'
  },
  {
    productId: 'PRD-007',
    name: 'Apple Watch Series 9 45mm GPS',
    description: 'Advanced health and fitness tracking with always-on Retina display. Track workouts, monitor heart health, and stay connected.',
    price: 385000,
    stock: 10,
    category: 'smartwatches',
    images: [],
    specifications: {
      brand: 'Apple',
      model: 'Watch Series 9',
      warranty: '1 year Apple warranty',
      features: ['S9 chip', 'Always-on display', 'Heart rate monitor', 'ECG', 'Blood oxygen'],
      condition: 'new'
    },
    pricing: {
      cost: 350000,
      discount: 0
    },
    inventory: {
      sku: 'APL-AWS9-45',
      reorderLevel: 5
    },
    featured: false,
    status: 'active'
  },
  {
    productId: 'PRD-008',
    name: 'iPad Air M2 11" 128GB WiFi',
    description: 'Powerful and versatile iPad with M2 chip. Perfect for creativity, productivity, and entertainment. Works with Apple Pencil.',
    price: 875000,
    stock: 9,
    category: 'tablets',
    images: [],
    specifications: {
      brand: 'Apple',
      model: 'iPad Air M2',
      warranty: '1 year Apple warranty',
      features: ['M2 chip', '11" Liquid Retina', '128GB storage', 'Apple Pencil support', 'Touch ID'],
      condition: 'new'
    },
    pricing: {
      cost: 800000,
      discount: 0
    },
    inventory: {
      sku: 'APL-IPA-M2-128',
      reorderLevel: 4
    },
    featured: false,
    status: 'active'
  },
  {
    productId: 'PRD-009',
    name: 'PlayStation 5 Slim 1TB Bundle',
    description: 'Latest PS5 Slim console with 1TB storage and two controllers. Includes FIFA 24 and Call of Duty. Ready to play!',
    price: 685000,
    stock: 6,
    category: 'gaming',
    images: [],
    specifications: {
      brand: 'Sony',
      model: 'PlayStation 5 Slim',
      warranty: '1 year Sony warranty',
      features: ['1TB SSD', '4K gaming', 'Ray tracing', '2 controllers', 'FIFA 24 + COD'],
      condition: 'new'
    },
    pricing: {
      cost: 620000,
      discount: 0
    },
    inventory: {
      sku: 'SNY-PS5S-1TB',
      reorderLevel: 3
    },
    featured: true,
    status: 'active'
  },
  {
    productId: 'PRD-010',
    name: 'Canon EOS R6 Mark II Camera Body',
    description: 'Professional mirrorless camera with 24MP sensor and advanced autofocus. Perfect for photography and videography.',
    price: 3250000,
    stock: 3,
    category: 'cameras',
    images: [],
    specifications: {
      brand: 'Canon',
      model: 'EOS R6 Mark II',
      warranty: '1 year Canon warranty',
      features: ['24MP sensor', '4K 60fps video', 'IBIS', 'Dual card slots', 'Animal eye AF'],
      condition: 'new'
    },
    pricing: {
      cost: 3000000,
      discount: 0
    },
    inventory: {
      sku: 'CAN-R6M2-BODY',
      reorderLevel: 2
    },
    featured: false,
    status: 'active'
  },
  {
    productId: 'PRD-011',
    name: 'Samsung 65" Neo QLED 4K TV',
    description: 'Premium smart TV with Quantum Dot technology and Neo QLED backlighting. Stunning picture quality and smart features.',
    price: 1450000,
    stock: 4,
    category: 'accessories',
    images: [],
    specifications: {
      brand: 'Samsung',
      model: '65" Neo QLED',
      warranty: '2 year Samsung warranty',
      features: ['65" 4K display', 'Quantum Dot', 'Neo QLED', 'Smart TV', '120Hz refresh'],
      condition: 'new'
    },
    pricing: {
      cost: 1300000,
      discount: 0
    },
    inventory: {
      sku: 'SAM-TV65-NEO',
      reorderLevel: 2
    },
    featured: false,
    status: 'active'
  },
  {
    productId: 'PRD-012',
    name: 'Google Pixel 8 Pro 256GB',
    description: 'AI-powered flagship with exceptional camera system. Pure Android experience with 7 years of updates.',
    price: 985000,
    stock: 14,
    category: 'smartphones',
    images: [],
    specifications: {
      brand: 'Google',
      model: 'Pixel 8 Pro',
      warranty: '1 year Google warranty',
      features: ['Tensor G3', '256GB storage', 'AI camera', '6.7" LTPO display', '7 years updates'],
      condition: 'new'
    },
    pricing: {
      cost: 880000,
      discount: 3
    },
    inventory: {
      sku: 'GOO-PIX8P-256',
      reorderLevel: 6
    },
    featured: false,
    status: 'active'
  }
];

export default sampleProducts;
