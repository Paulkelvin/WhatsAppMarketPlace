# 🚀 Quick Start Guide - TechHub WhatsApp Marketplace

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies (2 mins)

```powershell
npm install
```

### Step 2: Get Your API Keys (3 mins)

#### MongoDB (30 seconds)
1. Visit: https://www.mongodb.com/cloud/atlas/register
2. Create free cluster → Connect → Connection String
3. Copy: `mongodb+srv://username:password@...`

#### Google Gemini (30 seconds)
1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

#### Cloudinary (1 minute)
1. Visit: https://cloudinary.com/users/register/free
2. Dashboard → Copy: Cloud Name, API Key, API Secret

### Step 3: Configure Environment

```powershell
# Copy example file
Copy-Item .env.example .env

# Edit .env with notepad
notepad .env
```

**Paste your keys:**

```env
MONGODB_URI=mongodb+srv://your_connection_string
GEMINI_API_KEY=your_gemini_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret
ADMIN_PHONE=+2348012345678
```

### Step 4: Add Sample Products

```powershell
node src/data/seed.js
```

### Step 5: Start the Bot

```powershell
npm start
```

### Step 6: Connect WhatsApp

1. QR code will appear
2. Open WhatsApp → Settings → Linked Devices → Link Device
3. Scan the QR code
4. Done! 🎉

## ✅ Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with all keys
- [ ] MongoDB connection working
- [ ] Sample products loaded
- [ ] WhatsApp connected successfully
- [ ] Test message sent to bot

## 🧪 Quick Test

From another WhatsApp number, send:

```
Hello
```

Bot should respond with a welcome message!

Then try:

```
Show me smartphones
```

You should see product listings with images!

## 🐛 Common Issues

### "Cannot find module"
```powershell
npm install
```

### "MongoDB connection failed"
- Check URI in `.env`
- Add IP `0.0.0.0/0` to MongoDB whitelist

### "Invalid API key"
- Verify Gemini API key
- Check for extra spaces in `.env`

### QR Code Not Showing
- Delete `auth_info_baileys` folder
- Restart: `npm start`

## 📞 Getting Help

1. Check `README.md` for detailed docs
2. Review error logs
3. Verify all environment variables

## 🎯 Next Steps

1. **Add Product Images** (15-20 images needed)
2. **Customize Business Info** (`src/config/business.js`)
3. **Test Order Flow** (Place a test order)
4. **Review Admin Commands** (Send `!help`)
5. **Deploy to Production** (Railway/Render)

---

**Ready to launch your WhatsApp marketplace! 🚀**
