# 🚀 MAXSOUND - Simple Deployment Guide

## What You Need (5 minutes to set up)

### 1. Create a Cloudinary Account
**Why**: To host your audio files and album covers

1. Go to: https://cloudinary.com/users/register/free
2. Click "Sign Up for Free"
3. Fill in your email and create password
4. After signing up, you'll see your Dashboard
5. **COPY THESE 3 THINGS** (you'll need them later):
   - Cloud Name
   - API Key
   - API Secret

### 2. Create a Stripe Account
**Why**: To accept payments from customers

1. Go to: https://dashboard.stripe.com/register
2. Sign up with your email
3. After signing in, click "Developers" in the left menu
4. Click "API Keys"
5. **COPY THESE 2 THINGS**:
   - Publishable key (starts with `pk_test_`)
   - Secret key (starts with `sk_test_`) - Click "Reveal test key"

### 3. Create GitHub Repository
**Why**: To store your code online

1. Go to: https://github.com/new
2. Repository name: `maxsound`
3. Make it **Public**
4. **DO NOT** check "Initialize with README"
5. Click "Create repository"
6. **LEAVE THIS PAGE OPEN** - you'll need it in the next step

## Deploy to GitHub (2 minutes)

Copy and paste these commands ONE AT A TIME into Warp:

```bash
cd /Users/mediad/maxsound
```

```bash
git branch -M main
```

**IMPORTANT**: Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username in this command:
```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/maxsound.git
```

```bash
git push -u origin main
```

You'll be asked for your GitHub username and password. Use your GitHub **Personal Access Token** as the password (not your regular password).

**Don't have a token?** Create one here: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Give it a name like "Maxsound"
- Check "repo" permission
- Click "Generate token"
- Copy the token and use it as your password

## Deploy to Render (5 minutes)

### 1. Connect to Render
1. Go to: https://render.com
2. Click "Get Started for Free"
3. Sign in with GitHub (click the GitHub button)
4. Authorize Render to access your GitHub

### 2. Create Web Service
1. Click "New +" button (top right)
2. Select "Web Service"
3. Find and select your "maxsound" repository
4. Click "Connect"

### 3. Configure the Service
Render will auto-detect settings from `render.yaml`. You should see:
- Name: `maxsound`
- Build Command: `npm run build`
- Start Command: `npm start`

Just click **"Create Web Service"** at the bottom.

### 4. Add Your API Keys (IMPORTANT!)
1. Wait for the first deployment to start
2. Click on "Environment" in the left menu
3. Click "Add Environment Variable"
4. Add these ONE BY ONE (use your own values from Step 1):

| Key | Value (Your actual values) |
|-----|----------------------------|
| `STRIPE_SECRET_KEY` | sk_test_... (from Stripe) |
| `CLOUDINARY_CLOUD_NAME` | your_cloud_name (from Cloudinary) |
| `CLOUDINARY_API_KEY` | your_api_key (from Cloudinary) |
| `CLOUDINARY_API_SECRET` | your_api_secret (from Cloudinary) |

5. Click "Save Changes"

### 5. Wait for Deployment
- Render will automatically deploy your app
- This takes about 5-10 minutes the first time
- You'll see a URL like: `https://maxsound-xxxx.onrender.com`
- **COPY THIS URL** - this is your app!

## Using Your App

### Upload Music (Admin Interface)
1. Go to: `https://your-app-url.onrender.com/admin`
2. Fill in:
   - Track title (e.g., "Draw me Closer")
   - Artist name (e.g., "MEDIAD")
   - Price (e.g., "2.99")
3. Click "Choose File" for audio (select your MP3)
4. Click "Choose File" for cover (select your album art image)
5. Click "Upload Track"
6. **COPY THE LINK** that appears - this is your shareable link!

### Share with Customers
1. Send them the link (looks like: `https://your-app-url.onrender.com/track/abc-123`)
2. They'll see:
   - Your album artwork
   - Track title and artist
   - A button to play 5-second preview
   - A button to buy the song
   - After buying, a download button appears

## Testing Payments

For now, the app is in TEST MODE:
- When customers click "Buy", they'll see a confirmation dialog
- Click "OK" to simulate a purchase
- No real money is charged

**To accept real payments later:**
1. Complete Stripe account verification
2. Get your LIVE keys from Stripe (replace test keys)
3. Update environment variables in Render

## Troubleshooting

**"Upload failed"?**
- Check your Cloudinary credentials in Render
- Make sure you saved the environment variables
- Try re-deploying (Render Dashboard → Manual Deploy)

**"Track not found"?**
- Wait a few minutes - first deployment takes time
- Check Render logs (Dashboard → Logs)

**Need to update the app?**
- Make changes to files
- Run: `git add . && git commit -m "Updates" && git push`
- Render will auto-deploy (takes 2-3 minutes)

## Your App URLs

- **Admin (upload)**: `https://your-app.onrender.com/admin`
- **Customer tracks**: `https://your-app.onrender.com/track/TRACK_ID`
- **Home**: `https://your-app.onrender.com`

## Important Notes

⚠️ **Free Render Apps**:
- Go to sleep after 15 minutes of inactivity
- First visit after sleep takes 30-60 seconds to wake up
- Upgrade to paid plan ($7/month) to keep it always on

💡 **Tips**:
- Save your track links in a spreadsheet
- Test uploads with small audio files first
- Keep your API keys secret!

## Need Help?

Check these in order:
1. Render Dashboard → Logs (shows errors)
2. Browser console (press F12)
3. Verify all 4 environment variables are set in Render

---

Built with ❤️ for MEDIAD

Ready to sell your music! 🎵
