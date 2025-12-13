# MAXSOUND 🎵

A world-class music/audio app that allows you to upload songs or podcasts with album covers, share links with customers, and enable them to preview (5-second snippet), purchase, and download your content.

## Features

✅ **Admin Upload Interface**
- Upload audio files (songs/podcasts) and album covers
- Set title, artist name, and price
- Get shareable links automatically

✅ **Customer Experience**
- Beautiful, modern UI matching professional music platforms
- View album artwork, track info, and play count
- Play 5-second preview snippets
- Secure purchase with Stripe
- Download full track after purchase

✅ **Technology Stack**
- React + Vite frontend with Tailwind CSS
- Node.js + Express backend
- PostgreSQL database
- Cloudinary for media hosting
- Stripe for payments

## 🚀 Quick Deployment Guide (Non-Coders)

### Step 1: Get Your Free Accounts

1. **Cloudinary** (for hosting audio/images)
   - Go to: https://cloudinary.com/users/register/free
   - Sign up for free
   - After login, go to Dashboard
   - Copy: Cloud Name, API Key, API Secret

2. **Stripe** (for payments)
   - Go to: https://dashboard.stripe.com/register
   - Sign up for free
   - Go to Developers → API Keys
   - Copy: Publishable Key and Secret Key

3. **GitHub** (you probably already have this)
   - Go to: https://github.com
   - Make sure you're logged in

4. **Render** (for hosting)
   - Go to: https://render.com
   - Sign up with your GitHub account

### Step 2: Push to GitHub

1. Open Terminal (already in Warp!)
2. Navigate to the project:
   ```bash
   cd maxsound
   ```

3. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name it "maxsound"
   - Don't initialize with README
   - Click "Create repository"

4. Push your code (replace YOUR_USERNAME with your GitHub username):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/maxsound.git
   git push -u origin main
   ```

### Step 3: Deploy on Render

1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository (maxsound)
4. Render will detect the `render.yaml` file automatically
5. Click "Apply" to use the configuration

6. **Add Environment Variables:**
   Click on your service → Environment → Add Environment Variables:
   
   ```
   STRIPE_SECRET_KEY=sk_test_... (from Stripe)
   CLOUDINARY_CLOUD_NAME=your_cloud_name (from Cloudinary)
   CLOUDINARY_API_KEY=your_api_key (from Cloudinary)
   CLOUDINARY_API_SECRET=your_api_secret (from Cloudinary)
   ```

7. Click "Save Changes" - Render will automatically deploy!

8. Wait 5-10 minutes for the first deployment

9. Your app will be live at: `https://maxsound.onrender.com` (or similar)

### Step 4: Using Your App

**Admin Interface** (Upload songs):
- Go to: `https://your-app.onrender.com/admin`
- Fill in track details
- Upload audio file and cover image
- Click "Upload Track"
- Copy the shareable link that appears

**Customer Interface** (What your customers see):
- Share the link you got from admin (e.g., `https://your-app.onrender.com/track/abc123`)
- Customers can:
  - See the album artwork
  - Click "Listen to 5s Preview"
  - Click "Buy Song" to purchase
  - Download after purchasing

## 🛠️ Local Development (Optional)

If you want to test locally before deploying:

1. Install dependencies:
   ```bash
   cd maxsound
   npm run install-all
   ```

2. Create environment files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. Fill in the `.env` files with your API keys

4. Start development:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. Open: http://localhost:5173

## 📝 Environment Variables Reference

**Backend (.env)**:
- `DATABASE_URL`: PostgreSQL connection string (provided by Render)
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
- `FRONTEND_URL`: Your deployed app URL
- `NODE_ENV`: production

**Frontend (.env)**:
- `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

## 🎨 Customization

To change colors/design, edit:
- `frontend/src/index.css` - Background gradient
- `frontend/src/components/TrackDisplay.jsx` - Button styles

## 💳 Stripe Payment Setup

For production (real payments):
1. Complete Stripe account verification
2. Replace test keys with live keys
3. Test thoroughly before going live

For testing (current setup):
- Uses demo mode - click "OK" to simulate purchase
- No real charges made

## 📱 Features Overview

**Admin Upload**:
- Title, artist, price input
- Audio file upload (any format)
- Cover image upload
- Automatic 5-second preview generation
- Shareable link generation

**Customer View**:
- Responsive design (mobile & desktop)
- Album artwork display
- View counter
- 5-second audio preview
- Stripe payment integration
- Secure download after purchase
- Purchase persistence (remember purchased tracks)

## 🔒 Security Notes

- Never commit `.env` files to GitHub
- Use environment variables for all secrets
- Stripe handles payment security
- Database credentials managed by Render
- HTTPS enforced in production

## 🐛 Troubleshooting

**Deployment fails?**
- Check all environment variables are set in Render
- Make sure GitHub repository is connected
- Check Render logs for specific errors

**Upload not working?**
- Verify Cloudinary credentials
- Check file size limits (50MB default)
- Ensure audio and image files are selected

**Payment not working?**
- Verify Stripe keys (test mode for development)
- Check browser console for errors
- Enable Stripe test mode in dashboard

## 📞 Support

Built with ❤️ for MEDIAD

For issues:
1. Check Render logs
2. Check browser console
3. Verify all API keys are correct

## 📄 License

MIT License - Feel free to use for your music/podcast business!
