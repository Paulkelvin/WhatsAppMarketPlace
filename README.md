# 🛍️ TechHub Nigeria - WhatsApp Marketplace Automation

Advanced WhatsApp marketplace bot with AI-powered customer service, automated order processing, and comprehensive admin tools.

## 🚀 Features

- ✅ **AI-Powered Customer Service** (Google Gemini)
- 📦 **Product Catalog Management**
- 🛒 **Intelligent Order Processing**
- 💳 **Payment Integration** (Cash on Delivery + Paystack)
- 🚚 **Nationwide Delivery** (All Nigerian States)
- 👤 **Customer Management & VIP System**
- 📊 **Admin Dashboard & Analytics**
- 🤖 **Natural Language Understanding**
- 📱 **WhatsApp Multi-Device Support** (No Business Account Required)

## 🛠️ Tech Stack

- **WhatsApp**: Baileys (Multi-device WhatsApp Web API)
- **Backend**: Node.js 18+ with Express
- **Database**: MongoDB Atlas (Free Tier)
- **AI**: Google Gemini API (Free Tier)
- **Storage**: Cloudinary (Free Tier)
- **Hosting**: Vercel Serverless Functions
- **Payment**: Paystack (Nigeria)

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js** v18 or higher ([Download](https://nodejs.org/))
2. **MongoDB Atlas** account ([Sign up](https://www.mongodb.com/cloud/atlas/register))
3. **Google AI Studio** API key ([Get key](https://makersuite.google.com/app/apikey))
4. **Cloudinary** account ([Sign up](https://cloudinary.com/users/register/free))
5. **Paystack** account (optional) ([Sign up](https://paystack.com/signup))
6. **WhatsApp** phone number (Regular WhatsApp, not Business required)

## 🔧 Installation

### 1. Clone or Download the Project

```powershell
cd "c:\Users\paulo\Documents\WhatsApp Project"
```

### 2. Install Dependencies

```powershell
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/techhub

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Paystack Configuration (optional)
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# Business Configuration
BUSINESS_NAME=TechHub Nigeria
BUSINESS_PHONE=+234XXXXXXXXXX
BUSINESS_EMAIL=support@techhub.ng
ADMIN_PHONE=+234XXXXXXXXXX

# Server Configuration
PORT=3000
NODE_ENV=development
```

## 🔑 Getting API Keys

### MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account and cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<username>` and `<password>` with your credentials

### Google Gemini API (AI)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" → "Create API Key"
4. Copy the API key

### Cloudinary (Image Storage)

1. Sign up at [Cloudinary](https://cloudinary.com/users/register/free)
2. Go to Dashboard
3. Copy your Cloud Name, API Key, and API Secret

### Paystack (Payment Processing)

1. Sign up at [Paystack](https://paystack.com/signup)
2. Go to Settings → API Keys & Webhooks
3. Copy your Test Secret Key (use Live key for production)

## 🌱 Seed Database with Sample Products

Run this command to populate your database with 12 sample electronics products:

```powershell
node src/data/seed.js
```

This creates products in categories:
- 📱 Smartphones (iPhone, Samsung, Google Pixel)
- 💻 Laptops (MacBook, Dell XPS)
- 🎧 Audio (AirPods, Sony headphones)
- ⌚ Smart Watches (Apple Watch)
- 📱 Tablets (iPad Air)
- 🎮 Gaming (PlayStation 5)
- 📷 Cameras (Canon EOS)

## 🚀 Running the Application

### Development Mode (with auto-restart)

```powershell
npm run dev
```

### Production Mode

```powershell
npm start
```

## 📱 Connecting WhatsApp

1. Start the application
2. A QR code will appear in your terminal
3. Open WhatsApp on your phone
4. Go to **Settings** → **Linked Devices** → **Link a Device**
5. Scan the QR code
6. Wait for "WhatsApp Bot Connected Successfully!" message

**Note**: Your phone must stay connected to the internet, but the bot runs independently after linking.

## 🖼️ Adding Product Images

You need to provide approximately **15-20 product images** to match the sample products:

1. Prepare images for each product (can be multiple per product)
2. Images should be:
   - High quality (at least 800x800px)
   - Product-focused
   - JPEG or PNG format

### Option 1: Upload via Admin Commands (Coming Soon)

```
!addproduct
[Follow the prompts and send images]
```

### Option 2: Direct Database Update

```javascript
// In MongoDB Compass or your admin panel
db.products.updateOne(
  { productId: "PRD-001" },
  { $set: { images: [{ url: "https://cloudinary.com/...", publicId: "..." }] }}
)
```

### Option 3: Use Cloudinary API

```javascript
// Upload and get URL, then update product
```

## 💬 Using the Bot

### Customer Commands (Natural Language)

Customers can interact naturally:

- "Show me your products"
- "I want to buy iPhone 15"
- "What laptops do you have?"
- "How much is the MacBook?"
- "I want to order Samsung Galaxy"
- "Where is my order?"
- "Track order ORD-2311-0001"

### Admin Commands (WhatsApp)

As admin (using the ADMIN_PHONE), send these commands:

| Command | Description |
|---------|-------------|
| `!help` | Show all available commands |
| `!orders` | View pending orders |
| `!orders confirmed` | View confirmed orders |
| `!orders all` | View all recent orders |
| `!products` | List all products |
| `!updatestock PRD-001 50` | Update product stock |
| `!analytics` | View sales analytics |
| `!customers` | View customer statistics |
| `!broadcast` | Send message to all customers |

## 📊 Admin Dashboard (Web)

Access the web dashboard at:

```
http://localhost:3000/admin
```

Features:
- View all orders
- Update order status
- Manage products
- View analytics
- Customer management

## 🚢 Deployment to Vercel

### 1. Install Vercel CLI

```powershell
npm install -g vercel
```

### 2. Login to Vercel

```powershell
vercel login
```

### 3. Deploy

```powershell
vercel
```

### 4. Set Environment Variables

```powershell
vercel env add MONGODB_URI
vercel env add GEMINI_API_KEY
vercel env add CLOUDINARY_CLOUD_NAME
# ... add all other env variables
```

### 5. Deploy to Production

```powershell
vercel --prod
```

**Important**: For WhatsApp bot, you'll need a separate server that stays online (Vercel is for API endpoints only). Consider:
- **Railway** ([railway.app](https://railway.app))
- **Render** ([render.com](https://render.com))
- **Fly.io** ([fly.io](https://fly.io))

## 🔧 Configuration

### Business Settings

Edit `src/config/business.js` to customize:

- Business name, contact info
- Delivery zones and fees
- Payment methods
- Product categories
- AI behavior
- Policies (returns, warranty, etc.)

### Delivery Zones

All 36 Nigerian states are pre-configured with delivery fees:

| Zone | States | Fee | Delivery Time |
|------|--------|-----|---------------|
| Major Cities | Lagos, Abuja | ₦2,000 | 1-2 days |
| South-West | Ogun, Oyo, Osun... | ₦3,000 | 2-3 days |
| South-South/East | Rivers, Anambra... | ₦3,500 | 2-3 days |
| North-Central | Kogi, Kwara... | ₦4,000 | 2-3 days |
| North-West/East | Kaduna, Kano... | ₦5,000 | 3-4 days |

Free delivery on orders above **₦100,000**.

## 🤖 AI Customization

The AI prompt is in `src/services/gemini.js`. You can customize:

- Tone and personality
- Sales approach
- Response format
- Product recommendations logic
- Escalation rules

## 📁 Project Structure

```
whatsapp-marketplace/
├── src/
│   ├── whatsapp/
│   │   ├── bot.js              # WhatsApp bot initialization
│   │   └── handlers/
│   │       ├── message.js      # Message handling
│   │       ├── orders.js       # Order processing
│   │       └── admin.js        # Admin commands
│   ├── api/                    # Vercel serverless functions
│   ├── services/
│   │   ├── gemini.js          # AI service
│   │   ├── cloudinary.js      # Image uploads
│   │   └── database.js        # MongoDB connection
│   ├── models/
│   │   ├── Product.js         # Product schema
│   │   ├── Order.js           # Order schema
│   │   └── Customer.js        # Customer schema
│   ├── config/
│   │   └── business.js        # Business configuration
│   ├── utils/
│   │   ├── helpers.js         # Utility functions
│   │   └── logger.js          # Logging
│   ├── data/
│   │   ├── sampleProducts.js  # Sample data
│   │   └── seed.js            # Database seeder
│   └── index.js               # Entry point
├── .env                        # Environment variables
├── .env.example               # Environment template
├── package.json               # Dependencies
├── vercel.json                # Vercel configuration
└── README.md                  # This file
```

## 🧪 Testing

### Test Customer Flow

1. Send "Hello" from a different WhatsApp number
2. Try: "Show me smartphones"
3. Try: "I want iPhone 15 Pro Max"
4. Complete the order flow
5. Check admin phone for notification

### Test Admin Commands

From your admin phone:

```
!orders
!analytics
!products
```

## 🐛 Troubleshooting

### WhatsApp Not Connecting

- Delete `auth_info_baileys` folder and restart
- Check your internet connection
- Ensure phone is connected to internet

### Database Connection Failed

- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas (allow 0.0.0.0/0)
- Ensure database user has read/write permissions

### AI Not Responding

- Verify Gemini API key is valid
- Check API quota at Google AI Studio
- Review logs for errors

### Images Not Uploading

- Verify Cloudinary credentials
- Check image size (max 10MB)
- Ensure proper file format (JPEG/PNG)

## 📈 Next Steps

After setup, you can:

1. **Add Real Products**: Replace sample products with your inventory
2. **Upload Product Images**: Add images via Cloudinary
3. **Customize AI**: Adjust prompts for your brand voice
4. **Set Up Payments**: Configure Paystack for live payments
5. **Deploy**: Host on Railway or Render for 24/7 operation
6. **Marketing**: Share your WhatsApp number with customers

## 🔐 Security Best Practices

- Never commit `.env` file
- Use environment variables for all secrets
- Enable MongoDB IP whitelist
- Use strong passwords
- Regular backups of database
- Monitor API usage and costs

## 📞 Support

For issues or questions:

- Check logs: `logs/` folder
- Review error messages carefully
- Ensure all environment variables are set
- Test with sample data first

## 📝 License

MIT License - Feel free to modify and use for your business.

## 🙏 Acknowledgments

Built with:
- [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
- [Google Gemini](https://ai.google.dev/) - AI Capabilities
- [MongoDB](https://www.mongodb.com/) - Database
- [Cloudinary](https://cloudinary.com/) - Media Storage
- [Paystack](https://paystack.com/) - Payment Processing

---

**TechHub Nigeria** - Your Trusted Electronics Partner 🇳🇬
```

