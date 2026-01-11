# Local Testing Guide - Favicons & OG Images

Quick guide to test favicons and OG images on your local development environment.

---

## 🚀 Quick Start

### Step 1: Start Frontend Dev Server

**Option A: Using PowerShell Script (Easiest)**
```powershell
cd frontend
.\start-dev.ps1
```

**Option B: Using npm directly**
```powershell
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Server will be available at:** `http://localhost:5173`

---

## ✅ Testing Favicons

### Method 1: Visual Check (Easiest)

1. **Open your browser** and go to: `http://localhost:5173`
2. **Look at the browser tab** - you should see your favicon
3. **Check different pages** - favicon should appear on all pages

### Method 2: Browser DevTools (Detailed)

1. **Open DevTools** (F12 or Right-click → Inspect)
2. **Go to Network tab**
3. **Reload the page** (Ctrl+R or F5)
4. **Filter by "favicon"** or search for:
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `apple-touch-icon.png`

**What to check:**
- ✅ All favicon files return **200 OK** status
- ✅ No **404 Not Found** errors
- ✅ Files load quickly (< 100ms)

### Method 3: Direct URL Test

Open these URLs directly in your browser:

```
http://localhost:5173/favicon-16x16.png
http://localhost:5173/favicon-32x32.png
http://localhost:5173/apple-touch-icon.png
http://localhost:5173/favicon.ico
```

**Expected:** Images should display correctly

### Method 4: View Page Source

1. **Right-click on page** → **View Page Source** (or Ctrl+U)
2. **Search for "favicon"** (Ctrl+F)
3. **Verify these lines exist:**
   ```html
   <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
   <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
   <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
   ```

---

## 🖼️ Testing OG Image

### Method 1: View Page Source (Quick Check)

1. **Open your app** in browser: `http://localhost:5173`
2. **Right-click** → **View Page Source** (Ctrl+U)
3. **Search for "og:image"** (Ctrl+F)
4. **Verify this line exists:**
   ```html
   <meta property="og:image" content="https://ideabunch.com/og-image.jpg" />
   ```

**Note:** The URL shows production domain, but in dev mode it should still work if you test the local path.

### Method 2: Direct URL Test

Open this URL directly in your browser:

```
http://localhost:5173/og-image.jpg
```

**Expected:** The OG image should display (1200x630px image)

### Method 3: Browser DevTools - Elements Tab

1. **Open DevTools** (F12)
2. **Go to Elements tab**
3. **Find `<head>` section**
4. **Look for meta tags:**
   ```html
   <meta property="og:image" content="https://ideabunch.com/og-image.jpg" />
   <meta property="og:image:width" content="1200" />
   <meta property="og:image:height" content="630" />
   ```

### Method 4: Test with Local OG Image URL (Advanced)

If you want to test with localhost URL, you can temporarily modify the SEO component:

**File:** `frontend/src/components/common/Seo.jsx`

**Change line 13:**
```jsx
// Original (production):
ogImage = `${SITE_URL}/og-image.jpg`,

// Temporary (for local testing):
ogImage = `http://localhost:5173/og-image.jpg`,
```

**Then test:**
1. Reload your app
2. View page source
3. Check OG image URL points to localhost

**Remember to revert this change before committing!**

### Method 5: Online OG Image Validators (Local Testing)

Some tools can test localhost URLs:

1. **Open Graph Preview:**
   - Visit: https://www.opengraph.xyz/
   - Enter: `http://localhost:5173` (may not work - requires public URL)

2. **Facebook Debugger:**
   - Requires public URL (won't work with localhost)
   - Use this after deploying to production

3. **Local HTML File Test:**
   - Create a test HTML file with OG meta tags
   - Open in browser to see preview

---

## 🔍 Complete Verification Checklist

### Favicons ✅

- [ ] Favicon appears in browser tab
- [ ] No 404 errors in Network tab for favicon files
- [ ] `favicon-16x16.png` loads successfully
- [ ] `favicon-32x32.png` loads successfully
- [ ] `apple-touch-icon.png` loads successfully
- [ ] Favicon appears on all pages (home, product, blog, etc.)

### OG Image ✅

- [ ] `og-image.jpg` file exists in `frontend/public/`
- [ ] OG image loads at `/og-image.jpg` URL
- [ ] Meta tags include `og:image` property
- [ ] Meta tags include `og:image:width` (1200)
- [ ] Meta tags include `og:image:height` (630)
- [ ] Image dimensions are correct (1200x630px)

---

## 🐛 Troubleshooting

### Favicon Not Showing?

1. **Clear browser cache:**
   - Chrome: Ctrl+Shift+Delete → Clear cached images
   - Or: Hard refresh (Ctrl+Shift+R)

2. **Check file paths:**
   - Files must be in `frontend/public/` directory
   - File names must match exactly (case-sensitive)

3. **Check browser console:**
   - Open DevTools → Console tab
   - Look for 404 errors

4. **Verify Vite is serving public files:**
   - Files in `public/` should be accessible at root path
   - Example: `public/favicon.png` → `/favicon.png`

### OG Image Not Loading?

1. **Check file exists:**
   ```powershell
   Test-Path frontend\public\og-image.jpg
   ```

2. **Verify file size:**
   - Should be under 1MB
   - Check: `Get-Item frontend\public\og-image.jpg | Select Length`

3. **Check meta tags in source:**
   - View page source
   - Search for "og:image"
   - Verify URL is correct

4. **Test direct URL:**
   - Open `http://localhost:5173/og-image.jpg` directly
   - Should display the image

---

## 📝 Quick Test Script

Run this PowerShell script to verify all files exist:

```powershell
# Test Favicon Files
$faviconFiles = @(
    "frontend\public\favicon-16x16.png",
    "frontend\public\favicon-32x32.png",
    "frontend\public\apple-touch-icon.png",
    "frontend\public\favicon.ico"
)

Write-Host "Checking Favicon Files..." -ForegroundColor Cyan
foreach ($file in $faviconFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length / 1KB
        Write-Host "✓ $file ($([math]::Round($size, 1)) KB)" -ForegroundColor Green
    } else {
        Write-Host "✗ $file (MISSING)" -ForegroundColor Red
    }
}

# Test OG Image
Write-Host "`nChecking OG Image..." -ForegroundColor Cyan
$ogImage = "frontend\public\og-image.jpg"
if (Test-Path $ogImage) {
    $size = (Get-Item $ogImage).Length / 1KB
    $img = [System.Drawing.Image]::FromFile((Resolve-Path $ogImage))
    Write-Host "✓ $ogImage" -ForegroundColor Green
    Write-Host "  Size: $([math]::Round($size, 1)) KB" -ForegroundColor Gray
    Write-Host "  Dimensions: $($img.Width)x$($img.Height)px" -ForegroundColor Gray
    $img.Dispose()
} else {
    Write-Host "✗ $ogImage (MISSING)" -ForegroundColor Red
}
```

---

## 🎯 Expected Results

### When Everything Works:

✅ **Browser Tab:** Shows your favicon  
✅ **Network Tab:** All favicon requests return 200 OK  
✅ **Page Source:** Contains all favicon and OG meta tags  
✅ **Direct URLs:** All image files load correctly  
✅ **No Console Errors:** No 404s or failed requests  

---

## 🚀 Next Steps After Local Testing

Once everything works locally:

1. **Test in production** after deployment
2. **Use Facebook Debugger** with production URL
3. **Test on Twitter Card Validator** with production URL
4. **Verify on LinkedIn Post Inspector** with production URL

---

**Happy Testing!** 🎉




