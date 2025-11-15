# 🎯 SETUP INSTRUCTIONS - Read This First!

## 📸 IMPORTANT: Product Images Required

Your marketplace has **12 sample products** but **NO IMAGES YET**. You need to provide approximately **15-20 product images**.

### Images Needed For:

1. **iPhone 15 Pro Max** (2-3 images)
2. **Samsung Galaxy S24 Ultra** (2-3 images)
3. **MacBook Pro 14" M3** (2-3 images)
4. **Dell XPS 15** (1-2 images)
5. **AirPods Pro 2nd Gen** (1 image)
6. **Sony WH-1000XM5 Headphones** (1-2 images)
7. **Apple Watch Series 9** (1-2 images)
8. **iPad Air M2** (1-2 images)
9. **PlayStation 5 Slim** (1-2 images)
10. **Canon EOS R6 Mark II** (1-2 images)
11. **Samsung 65" Neo QLED TV** (1 image)
12. **Google Pixel 8 Pro** (1-2 images)

### How to Add Images:

**Option 1: Use Free Stock Images (Fastest)**
- Visit: https://unsplash.com or https://pexels.com
- Search for each product
- Download high-quality images

**Option 2: Cloudinary Upload**
1. Go to your Cloudinary dashboard
2. Upload images to `techhub-products` folder
3. Copy the image URLs
4. Update products in MongoDB

**Option 3: Update Products via Script** (Coming after images are ready)

---

## 🚀 INSTALLATION STEPS

### Step 1: Install Node.js Dependencies

```powershell
npm install
```

**Expected output:**
- Installing packages...
- Added 200+ packages

### Step 2: Get API Keys

You need **3 FREE API keys** (takes 5 minutes total):

#### A. MongoDB Atlas (Database)

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create a cluster (select FREE tier)
4. Click **Connect** → **Connect your application**
5. Copy connection string like:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/
   ```
6. **Important**: Replace `<username>` and `<password>` with your actual credentials

#### B. Google Gemini API (AI)

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click **"Get API Key"** → **"Create API Key"**
4. Copy the API key (starts with `AIza...`)

#### C. Cloudinary (Image Storage)

1. Go to: https://cloudinary.com/users/register/free
2. Create free account
3. Go to **Dashboard**
4. Copy these 3 values:
   - Cloud Name
   - API Key
   - API Secret

#### D. Paystack (Optional - for Bank Transfers)

1. Go to: https://paystack.com/signup
2. Create account
3. Go to **Settings** → **API Keys & Webhooks**
4. Copy **Test Secret Key** (starts with `sk_test_...`)

### Step 3: Configure Environment Variables

```powershell
# Copy the example file
Copy-Item .env.example .env

# Open with notepad
notepad .env
```

**Fill in your keys:**

```env
# MongoDB - REQUIRED
MONGODB_URI=mongodb+srv://youruser:yourpass@cluster.mongodb.net/techhub

# Google Gemini - REQUIRED
GEMINI_API_KEY=AIzaSy...your_key_here

# Cloudinary - REQUIRED
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_secret_here

# Paystack - OPTIONAL
PAYSTACK_SECRET_KEY=sk_test_your_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_key_here

# Business Info - REQUIRED
BUSINESS_NAME=TechHub Nigeria
BUSINESS_PHONE=+2348012345678
BUSINESS_EMAIL=support@techhub.ng
ADMIN_PHONE=+2348012345678
```

**Save and close the file.**

### Step 4: Verify Setup

```powershell
npm run verify
```

**Expected output:**
```
✅ MONGODB_URI: Set
✅ GEMINI_API_KEY: Set
✅ CLOUDINARY_CLOUD_NAME: Set
...
✅ SETUP COMPLETE!
```

If you see ❌ errors, fix them before continuing.

### Step 5: Load Sample Products

```powershell
npm run seed
```

**Expected output:**
```
✅ Inserted 12 products
📊 Products by category:
   smartphones: 3 products
   laptops: 2 products
   ...
```

### Step 6: Start the Bot

```powershell
npm start
```

**Expected output:**
```
🚀 Starting TechHub WhatsApp Marketplace...
✅ MongoDB connected successfully
✅ Gemini AI initialized successfully
```

Then a **QR CODE** will appear in your terminal!

### Step 7: Connect WhatsApp

1. **Open WhatsApp** on your phone
2. Go to **Settings** (⋮ menu) → **Linked Devices**
3. Tap **"Link a Device"**
4. **Scan the QR code** from your terminal
5. Wait for: `✅ WhatsApp Bot Connected Successfully!`

**DONE! Your bot is now live! 🎉**

---

## ✅ Testing Your Bot

### Test 1: Send Message from Another Number

From a different WhatsApp number, send:

```
Hello
```

**Expected**: Bot responds with a welcome message

### Test 2: Browse Products

Send:

```
Show me smartphones
```

**Expected**: Bot shows list of phones (without images for now)

### Test 3: Place an Order

Send:

```
I want to buy iPhone 15
```

**Expected**: Bot guides you through the order process

### Test 4: Admin Commands

From your **ADMIN_PHONE**, send:

```
!help
```

**Expected**: List of admin commands

Try:

```
!orders
!analytics
!products
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module"

**Solution:**
```powershell
Remove-Item node_modules -Recurse -Force
npm install
```

### Issue: "MongoDB connection failed"

**Solutions:**
1. Check your MongoDB URI in `.env`
2. Go to MongoDB Atlas → Network Access
3. Add IP address `0.0.0.0/0` (allow from anywhere)
4. Verify username and password are correct

### Issue: "Invalid Gemini API key"

**Solutions:**
1. Go to: https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy entire key (including `AIza...`)
4. Update `.env` file

### Issue: QR Code Not Showing

**Solutions:**
```powershell
# Delete auth folder
Remove-Item auth_info_baileys -Recurse -Force

# Restart bot
npm start
```

### Issue: Bot Not Responding

**Solutions:**
1. Check bot is still running (terminal should be active)
2. Verify phone is connected to internet
3. Check logs for errors
4. Restart the bot

---

## 📁 What You Have Now

```
✅ WhatsApp bot connected
✅ Database with 12 products
✅ AI-powered customer service
✅ Order processing system
✅ Admin commands working
✅ Payment integration (COD + Transfer)
✅ Delivery zones for all Nigeria
❌ Product images (YOU NEED TO ADD)
```

---

## 🎯 Next Steps

### 1. Add Product Images (PRIORITY)

You have 3 options:

**A. Quick Test (Use Placeholder)**
For now, products will show without images (text only)

**B. Add Real Images**
1. Collect 15-20 product images
2. Upload to Cloudinary
3. Update database with image URLs

**C. Change Products**
Replace sample electronics with your actual products

### 2. Customize Business Info

Edit: `src/config/business.js`

Change:
- Business name
- Contact details
- Delivery fees
- Payment methods
- Return policy

### 3. Test Complete Order Flow

1. Place test order from customer number
2. Receive admin notification
3. Update order status with `!orders`
4. Verify customer gets updates

### 4. Deploy to Production

For 24/7 operation, deploy to:
- **Railway** (recommended): https://railway.app
- **Render**: https://render.com
- **Fly.io**: https://fly.io

Vercel is only for API endpoints, not for the WhatsApp bot.

---

## 📞 Support

### Logs Location
Check: Terminal output (real-time)

### Common Commands

```powershell
# Start bot
npm start

# Start with auto-restart (development)
npm run dev

# Verify setup
npm run verify

# Add sample products
npm run seed

# Stop bot
Ctrl + C
```

### Environment Variables

If you change `.env`, restart the bot:

```powershell
# Stop (Ctrl+C) then:
npm start
```

---

## 🎉 Congratulations!

Your WhatsApp Marketplace is now operational!

**What works:**
- ✅ Customers can browse products
- ✅ AI handles conversations
- ✅ Orders are processed
- ✅ Admins get notifications
- ✅ Analytics available

**What you need to do:**
- 📸 Add product images
- 📝 Customize business details
- 🧪 Test thoroughly
- 🚀 Deploy for production

---

**You're ready to launch! 🚀🇳🇬**
