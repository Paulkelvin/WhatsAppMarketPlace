# Railway Deployment Guide

## Why Railway?
- ✅ Perfect for WhatsApp bots (always-on)
- ✅ Free $5/month credit (enough for small bot)
- ✅ Easy deployment from GitHub
- ✅ Automatic restarts
- ✅ Environment variables support
- ✅ Persistent storage for auth

## Step-by-Step Deployment

### 1. Sign Up for Railway
1. Go to: https://railway.app
2. Click "Login with GitHub"
3. Authorize Railway

### 2. Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose: `Paulkelvin/WhatsAppMarketPlace`

### 3. Add Environment Variables
In Railway dashboard, go to Variables and add:

```
MONGODB_URI=mongodb+srv://ibukunadesanya0_db_user:fjzinpnjntT9Gwdp@whatsappmarketplace.qhet2m9.mongodb.net/?appName=WhatsAppMarketPlace

GEMINI_API_KEY=AIzaSyCxhD86EUAV0sDOMIZRIMBSM4cz-CNf-jA

CLOUDINARY_CLOUD_NAME=dpr4ig1gy
CLOUDINARY_API_KEY=189337744827388
CLOUDINARY_API_SECRET=hYKAgkXIy9cpmzQLWXtsLUiOqkE

BUSINESS_NAME=TechHub Nigeria
BUSINESS_PHONE=+2348012345678
BUSINESS_EMAIL=support@techhub.ng
ADMIN_PHONE=+2348012345678

SESSION_NAME=techhub-session
PORT=3000
NODE_ENV=production
```

### 4. Configure Start Command
Railway will auto-detect from `package.json`:
- Start command: `npm start`

### 5. Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Check logs for QR code
4. Connect WhatsApp by scanning QR

### 6. Keep Bot Running
- Railway keeps your bot running 24/7
- Auto-restarts on crashes
- Persistent storage for WhatsApp session

## Important Notes

⚠️ **QR Code on Railway**:
- You'll see QR code in deployment logs
- Scan it with WhatsApp to connect
- Session persists after restart

⚠️ **Storage**:
- Railway provides persistent volumes
- WhatsApp session saved automatically
- No need to rescan after restarts

⚠️ **Monitoring**:
- View logs in Railway dashboard
- Check bot status
- Monitor resource usage

## Cost
- Free $5/month credit
- Bot uses ~$3-4/month
- Upgrade if needed for more resources

## Alternative: Render.com

If you prefer Render:
1. Go to: https://render.com
2. Connect GitHub
3. Create "Web Service"
4. Choose repository
5. Add environment variables
6. Deploy!

Render also has free tier but with some limitations.

## For Local Development Only

If you want to run locally and use Vercel for admin panel:
1. Keep bot running on your computer: `npm start`
2. Deploy admin API endpoints to Vercel
3. Not recommended for production

## Troubleshooting Railway

### QR Code Not Visible
- Check deployment logs
- Look for "Scan this QR code with WhatsApp"
- May need to wait 2-3 minutes after first deploy

### Bot Disconnecting
- Check Railway resource limits
- Verify environment variables
- Review error logs

### Session Lost After Restart
- Ensure Railway has persistent storage
- Check `auth_info_baileys` folder exists
- May need to configure volume mount

## Next Steps After Railway Deployment

1. ✅ Bot running 24/7 on Railway
2. ✅ WhatsApp connected and persistent
3. ✅ Customers can interact anytime
4. 📊 Use Vercel for admin dashboard (optional)
5. 📱 Share your WhatsApp number with customers!

---

**Railway is the best option for your WhatsApp bot!** 🚀
