# PWA Icon Setup Instructions

## Current Status
The PWA manifest references two icon sizes:
- `pwa-192.png` (192x192 pixels)
- `pwa-512.png` (512x512 pixels)

## How to Add Your Custom Icons

### Option 1: If you have a square image/logo
1. Prepare your icon image (square, preferably 1024x1024 or larger)
2. Resize it to create two versions:
   - 192x192 pixels → Save as `pwa-192.png`
   - 512x512 pixels → Save as `pwa-512.png`
3. Place both files in: `frontend/public/`
4. Commit and push to GitHub

### Option 2: Use an online icon generator
1. Visit: https://www.pwabuilder.com/imageGenerator
2. Upload your logo/image
3. It will generate all required sizes
4. Download the 192x192 and 512x512 versions
5. Rename them to `pwa-192.png` and `pwa-512.png`
6. Place in: `frontend/public/`
7. Commit and push to GitHub

### Option 3: Manual creation with image editor
If you have your icon already:

**Mac (Preview):**
1. Open your icon in Preview
2. Tools → Adjust Size
3. Width: 192, Height: 192 (lock aspect ratio)
4. Save as `pwa-192.png`
5. Repeat for 512x512 → Save as `pwa-512.png`
6. Move both to `frontend/public/`

**Online (Squoosh):**
1. Visit: https://squoosh.app/
2. Upload your icon
3. Resize to 192x192, download as PNG
4. Repeat for 512x512
5. Move to `frontend/public/`

## Important Notes
- Icons should be square (same width and height)
- PNG format with transparency works best
- The icon will show on the user's home screen after installing the PWA
- Higher resolution source images give better results

## Testing After Upload
1. Push the icon files to GitHub
2. Render will deploy automatically
3. On mobile: Remove old PWA if installed
4. Reinstall PWA - your custom icon should appear on home screen

## File Location
Place your icons here:
```
maxsound/
└── frontend/
    └── public/
        ├── pwa-192.png  ← Your 192x192 icon
        └── pwa-512.png  ← Your 512x512 icon
```
