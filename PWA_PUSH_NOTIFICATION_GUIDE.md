# MAXSOUND - PWA & Push Notification Guide

## 🎯 Overview
MAXSOUND is a fully functional Progressive Web App (PWA) with push notifications that alerts users when new tracks are uploaded.

---

## 🔔 Push Notification System - FULLY IMPLEMENTED

### ✅ Backend Components

#### 1. VAPID Configuration
- **File:** `backend/utils/notifications.js`
- **Function:** `configureWebPush()`
- **Environment Variables Required:**
  - `VAPID_PUBLIC_KEY`
  - `VAPID_PRIVATE_KEY`
  - `VAPID_SUBJECT` (e.g., mailto:contact@maxsound.com)

#### 2. Database
- **Table:** `push_subscriptions`
- **Stores:** User device push subscription endpoints

#### 3. Push API Endpoints
- **File:** `backend/routes/push.js`
- **Endpoints:**
  - `GET /api/push/public-key` - Get VAPID public key
  - `POST /api/push/subscribe` - Subscribe device to notifications
  - `DELETE /api/push/subscribe` - Unsubscribe device

#### 4. Notification Trigger
- **File:** `backend/routes/uploads.js` (lines 138-140)
- **Trigger:** Automatically sends notification when track is uploaded
- **Function:** `notifyNewTrack({ id, title, artist })`

---

### ✅ Frontend Components

#### 1. Service Worker
- **File:** `frontend/public/sw.js`
- **Features:**
  - Offline caching (v4)
  - Push event handler
  - Notification click handler

#### 2. PWA Registration
- **File:** `frontend/src/pwa.js`
- **Function:** `registerPWA()`
- **Actions:**
  - Registers service worker
  - Requests notification permission
  - Subscribes to push notifications
  - Sends subscription to backend

#### 3. Manifest
- **File:** `frontend/public/manifest.webmanifest`
- **Settings:**
  - `start_url: "/browse"` (opens to user view)
  - Custom icons (192x192, 512x512)
  - Standalone display mode

---

## 📱 How Push Notifications Work

### User Flow:
1. User installs PWA from `/browse` page
2. App automatically requests notification permission
3. User grants permission
4. Device subscribes to push notifications
5. Subscription saved in database

### Admin Flow:
1. Admin uploads new track at `/`
2. Backend saves track to database
3. Backend automatically calls `notifyNewTrack()`
4. Notification sent to ALL subscribed devices

### Notification:
```
Title: "New upload on MAXSOUND"
Body: "Artist – Track Title"
Action: Click to open /track/[id]
```

---

## 🌐 URLs

### For Admin (You):
- **Admin Dashboard:** `https://maxsound-app.onrender.com/`
  - Manage Tracks tab (view, delete)
  - Upload New Track tab
  - View Customer Page button

### For Customers:
- **Browse Page:** `https://maxsound-app.onrender.com/browse`
  - Clean interface
  - Track catalog
  - No admin buttons visible
  - Footer with copyright

### Individual Tracks:
- **Track Page:** `https://maxsound-app.onrender.com/track/[id]`
  - Preview player
  - Purchase button
  - Back to Browse button

---

## 🧪 Testing Push Notifications

### Step 1: Subscribe
1. Open PWA on phone (from home screen)
2. Allow notifications when prompted
3. Device is now subscribed

### Step 2: Test
1. Go to admin dashboard on desktop
2. Upload a new track
3. Check your phone - notification should appear!

### Step 3: Verify
1. Click the notification
2. Should open to the track page
3. Can preview and purchase

---

## 🔒 Hard Locks

Current hard locks (safe restore points):
- `hard-lock-2025-12-17` - Complete PWA with clean customer view
- `hard-lock-2025-12-16` - PWA with admin/browse separation
- `hard-lock-2025-12-15` - Initial PWA implementation

To rollback: `git checkout hard-lock-2025-12-17`

---

## 🎨 PWA Features

### ✅ Implemented:
- ✅ Installable (Add to Home Screen)
- ✅ Custom Maxsound icons
- ✅ Offline support (service worker caching)
- ✅ Push notifications
- ✅ Standalone display mode (no browser UI)
- ✅ Fast loading (cached assets)
- ✅ Deep linking to tracks

### User Experience:
- Opens like native app
- Works offline (cached content)
- Receives notifications
- Fast and responsive
- Professional appearance

---

## 🔧 Troubleshooting

### Notifications Not Working?
1. Check Render logs: "✓ VAPID keys configured successfully"
2. Verify VAPID env vars are set in Render
3. User must grant permission when prompted
4. Test with: Upload a track and check phone

### PWA Not Installing?
1. Must use HTTPS (Render provides this)
2. Must have valid manifest
3. Must have service worker
4. All files present and working ✅

### Old Version Showing?
1. Service worker updates automatically
2. Cache version: v4 (clears old caches)
3. Delete and reinstall PWA if needed
4. Or clear browser cache

---

## 📊 System Architecture

```
User Device
    ↓
PWA (Frontend)
    ↓
Service Worker (sw.js)
    ↓
Push Subscription
    ↓
Backend API
    ↓
Database (push_subscriptions)
    ↓
Web Push Service
    ↓
User's Device Notification
```

---

## ✨ Everything is Working!

All components are implemented, tested, and deployed:
- ✅ Backend: VAPID configured, endpoints ready
- ✅ Frontend: PWA registered, service worker active
- ✅ Database: Subscriptions stored
- ✅ Notifications: Auto-send on upload
- ✅ Icons: Custom Maxsound branding
- ✅ Routing: Clean separation (admin vs customer)

**The system is production-ready!** 🎉

---

Last Updated: December 17, 2025
Hard Lock: hard-lock-2025-12-17
